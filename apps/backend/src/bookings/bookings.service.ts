import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  Prisma,
  VehicleStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { VehiclesRepository } from '../vehicles/vehicles.repository';
import {
  PaginatedResult,
  buildPaginatedResult,
  getPaginationParams,
} from '../common/pagination';
import { buildOrderBy } from '../common/sorting';
import { parseDateOnly, rentalDays } from './booking-dates';
import {
  BookingsRepository,
  BookingWithRelations,
} from './bookings.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

const SORTABLE = ['createdAt', 'pickupDate', 'returnDate', 'totalAmount'] as const;

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [
    BookingStatus.HANDED_OVER,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.HANDED_OVER]: [BookingStatus.COMPLETED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
};

@Injectable()
export class BookingsService {
  constructor(
    private readonly repo: BookingsRepository,
    private readonly vehicles: VehiclesRepository,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateBookingDto,
    userId: string,
  ): Promise<BookingWithRelations> {
    const vehicle = await this.vehicles.findById(dto.vehicleId);
    if (!vehicle) {
      throw new BadRequestException('Vehicle not found');
    }
    if (
      vehicle.status === VehicleStatus.INACTIVE ||
      vehicle.status === VehicleStatus.MAINTENANCE
    ) {
      throw new BadRequestException('Vehicle is not available for booking');
    }

    let pickupDate: Date;
    let returnDate: Date;
    try {
      pickupDate = parseDateOnly(dto.pickupDate);
      returnDate = parseDateOnly(dto.returnDate);
    } catch {
      throw new BadRequestException('Invalid pickup or return date');
    }

    if (returnDate < pickupDate) {
      throw new BadRequestException('Return date must be on or after pickup date');
    }

    const today = parseDateOnly(new Date().toISOString().slice(0, 10));
    if (pickupDate < today) {
      throw new BadRequestException('Pickup date cannot be in the past');
    }

    const overlaps = await this.repo.countOverlapping({
      vehicleId: vehicle.id,
      pickupDate,
      returnDate,
    });
    if (overlaps > 0) {
      throw new BadRequestException(
        'Vehicle is already booked for those dates',
      );
    }

    const days = rentalDays(pickupDate, returnDate);
    const pricePerDay = Number(vehicle.pricePerDay);
    const totalAmount = Math.round(pricePerDay * days * 100) / 100;

    const booking = await this.repo.createWithPayment({
      booking: {
        userId,
        vehicleId: vehicle.id,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone.trim(),
        email: dto.email.trim().toLowerCase(),
        pickupDate,
        returnDate,
        pickupLocation: dto.pickupLocation.trim(),
        notes: dto.notes?.trim() || null,
        status: BookingStatus.PENDING,
        totalAmount,
        paymentMethod: dto.paymentMethod,
      },
      payment: {
        amount: totalAmount,
        provider: dto.paymentMethod,
        status: 'PENDING',
      },
    });

    await this.audit.record({
      actorId: userId,
      action: 'bookings.create',
      entity: 'Booking',
      entityId: booking.id,
      meta: {
        vehicleId: vehicle.id,
        days,
        totalAmount,
        paymentMethod: dto.paymentMethod,
      },
    });

    return booking;
  }

  async completeSandboxPayment(
    id: string,
    userId: string,
  ): Promise<BookingWithRelations> {
    const booking = await this.findMine(id, userId);
    if (!booking.payment) {
      throw new BadRequestException('No payment on this booking');
    }
    if (booking.payment.status === 'PAID') {
      return booking;
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay a cancelled booking');
    }

    const transactionId = `sandbox-${booking.paymentMethod.toLowerCase()}-${Date.now()}`;
    await this.repo.markPaymentPaid(booking.id, transactionId);

    await this.audit.record({
      actorId: userId,
      action: 'bookings.payment.sandbox',
      entity: 'Payment',
      entityId: booking.payment.id,
      meta: { provider: booking.paymentMethod, transactionId },
    });

    return this.findMine(id, userId);
  }

  async listMine(
    userId: string,
    query: ListBookingsQueryDto,
  ): Promise<PaginatedResult<BookingWithRelations>> {
    const where: Prisma.BookingWhereInput = { userId };
    if (query.status) where.status = query.status;
    return this.paginate(where, query);
  }

  async findMine(id: string, userId: string): Promise<BookingWithRelations> {
    const booking = await this.repo.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new ForbiddenException('Not your booking');
    }
    return booking;
  }

  async cancelMine(
    id: string,
    userId: string,
    reason?: string,
  ): Promise<BookingWithRelations> {
    const booking = await this.findMine(id, userId);
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Only pending or confirmed bookings can be cancelled',
      );
    }
    return this.applyStatus(
      booking,
      BookingStatus.CANCELLED,
      userId,
      reason ?? 'Cancelled by customer',
    );
  }

  list(
    query: ListBookingsQueryDto,
  ): Promise<PaginatedResult<BookingWithRelations>> {
    const where: Prisma.BookingWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.vehicleId) where.vehicleId = query.vehicleId;
    if (query.userId) where.userId = query.userId;
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { username: { contains: q, mode: 'insensitive' } } },
        { vehicle: { name: { contains: q, mode: 'insensitive' } } },
        { vehicle: { brand: { contains: q, mode: 'insensitive' } } },
        { pickupLocation: { contains: q, mode: 'insensitive' } },
      ];
    }
    return this.paginate(where, query);
  }

  async findById(id: string): Promise<BookingWithRelations> {
    const booking = await this.repo.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateStatus(
    id: string,
    dto: UpdateBookingStatusDto,
    actorId: string,
  ): Promise<BookingWithRelations> {
    const booking = await this.findById(id);
    const allowed = ALLOWED_TRANSITIONS[booking.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot change status from ${booking.status} to ${dto.status}`,
      );
    }
    if (
      dto.status === BookingStatus.CANCELLED &&
      !dto.cancelReason?.trim()
    ) {
      throw new BadRequestException('Cancel reason is required');
    }
    return this.applyStatus(
      booking,
      dto.status,
      actorId,
      dto.cancelReason?.trim(),
    );
  }

  private async applyStatus(
    booking: BookingWithRelations,
    next: BookingStatus,
    actorId: string,
    cancelReason?: string,
  ): Promise<BookingWithRelations> {
    const data: Prisma.BookingUncheckedUpdateInput = { status: next };
    if (next === BookingStatus.CANCELLED) {
      data.cancelledAt = new Date();
      data.cancelReason = cancelReason ?? null;
    }

    const updated = await this.repo.update(booking.id, data);

    if (next === BookingStatus.HANDED_OVER) {
      await this.vehicles.update(booking.vehicleId, {
        status: VehicleStatus.RENTED,
      });
    }

    if (next === BookingStatus.COMPLETED || next === BookingStatus.CANCELLED) {
      const active = await this.repo.countActiveForVehicle(booking.vehicleId);
      if (active === 0) {
        await this.vehicles.update(booking.vehicleId, {
          status: VehicleStatus.AVAILABLE,
        });
      }
    }

    await this.audit.record({
      actorId,
      action: 'bookings.status',
      entity: 'Booking',
      entityId: booking.id,
      meta: { from: booking.status, to: next },
    });

    return updated;
  }

  private async paginate(
    where: Prisma.BookingWhereInput,
    query: ListBookingsQueryDto,
  ): Promise<PaginatedResult<BookingWithRelations>> {
    const { skip, take, page, limit } = getPaginationParams(query);
    const orderBy = buildOrderBy(
      query.sortBy,
      query.order,
      SORTABLE,
      'createdAt',
    );

    const [items, total] = await Promise.all([
      this.repo.findMany(where, orderBy, skip, take),
      this.repo.count(where),
    ]);

    return buildPaginatedResult(items, total, page, limit);
  }
}
