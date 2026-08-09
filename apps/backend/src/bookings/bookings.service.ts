import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
  Prisma,
  VehicleStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { FilesService } from '../files/files.service';
import { MailService, type BookingMailData } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
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
import { UpdateHandoverDocsDto } from './dto/update-handover-docs.dto';

export type BookingAdminView = BookingWithRelations & {
  nicUrl: string | null;
  licenceUrl: string | null;
  agreementUrl: string | null;
};

/** Customer-facing booking — never exposes NIC / licence file ids or URLs. */
export type BookingCustomerView = Omit<
  BookingWithRelations,
  'nicFileId' | 'licenceFileId' | 'agreementFileId'
> & {
  agreementUrl: string | null;
};

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
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly repo: BookingsRepository,
    private readonly vehicles: VehiclesRepository,
    private readonly audit: AuditService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly files: FilesService,
    private readonly notifications: NotificationsService,
  ) {}

  private vehicleLabel(booking: BookingWithRelations): string {
    return `${booking.vehicle.brand} ${booking.vehicle.model}`;
  }

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

    const paid = await this.findMine(id, userId);
    await this.safeSendMail('paid', paid);
    await this.notifyBooking(
      paid,
      'Payment received',
      `Your payment for ${paid.vehicle.brand} ${paid.vehicle.model} was successful.`,
    );
    return paid;
  }

  async listMine(
    userId: string,
    query: ListBookingsQueryDto,
  ): Promise<PaginatedResult<BookingCustomerView>> {
    const where: Prisma.BookingWhereInput = { userId };
    if (query.status) where.status = query.status;
    const page = await this.paginate(where, query);
    return {
      ...page,
      items: await Promise.all(
        page.items.map((booking) => this.toCustomerView(booking)),
      ),
    };
  }

  async findMine(id: string, userId: string): Promise<BookingWithRelations> {
    const booking = await this.repo.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new ForbiddenException('Not your booking');
    }
    return booking;
  }

  async findMineForCustomer(
    id: string,
    userId: string,
  ): Promise<BookingCustomerView> {
    const booking = await this.findMine(id, userId);
    return this.toCustomerView(booking);
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
    if (query.paid === true) {
      where.payment = { is: { status: 'PAID' } };
    } else if (query.paid === false) {
      // isNot also matches bookings whose payment row is missing entirely.
      where.payment = { isNot: { status: 'PAID' } };
    }
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

  async findByIdForAdmin(id: string): Promise<BookingAdminView> {
    const booking = await this.findById(id);
    return this.toAdminView(booking);
  }

  /** Record an offline payment (cash / bank transfer taken at the office). */
  async markPaidByAdmin(id: string, actorId: string): Promise<BookingAdminView> {
    const booking = await this.findById(id);
    if (!booking.payment) {
      throw new BadRequestException('No payment on this booking');
    }
    if (booking.payment.status === 'PAID') {
      throw new BadRequestException('Payment is already marked as paid');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot mark a cancelled booking as paid');
    }

    const transactionId = `manual-${Date.now()}`;
    await this.repo.markPaymentPaid(booking.id, transactionId);

    await this.audit.record({
      actorId,
      action: 'bookings.payment.manual',
      entity: 'Payment',
      entityId: booking.payment.id,
      meta: { provider: booking.paymentMethod, transactionId },
    });

    const paid = await this.findById(id);
    await this.safeSendMail('paid', paid);
    await this.notifyBooking(
      paid,
      'Payment received',
      `Your payment for ${paid.vehicle.brand} ${paid.vehicle.model} was recorded.`,
    );
    return this.toAdminView(paid);
  }

  async updateHandoverDocs(
    id: string,
    dto: UpdateHandoverDocsDto,
    actorId: string,
  ): Promise<BookingAdminView> {
    const booking = await this.findById(id);
    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.HANDED_OVER &&
      booking.status !== BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Handover documents can only be attached to confirmed or later bookings',
      );
    }

    const data: Prisma.BookingUncheckedUpdateInput = {};
    if (dto.nicFileId !== undefined) {
      await this.assertReadyFile(dto.nicFileId);
      data.nicFileId = dto.nicFileId || null;
    }
    if (dto.licenceFileId !== undefined) {
      await this.assertReadyFile(dto.licenceFileId);
      data.licenceFileId = dto.licenceFileId || null;
    }
    if (dto.agreementFileId !== undefined) {
      await this.assertReadyFile(dto.agreementFileId);
      data.agreementFileId = dto.agreementFileId || null;
    }
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No handover document fields provided');
    }

    const updated = await this.repo.update(booking.id, data);
    await this.audit.record({
      actorId,
      action: 'bookings.handover_docs',
      entity: 'Booking',
      entityId: booking.id,
      meta: data,
    });
    return this.toAdminView(updated);
  }

  async updateStatus(
    id: string,
    dto: UpdateBookingStatusDto,
    actorId: string,
  ): Promise<BookingAdminView> {
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
    if (dto.status === BookingStatus.HANDED_OVER) {
      if (!booking.nicFileId || !booking.licenceFileId) {
        throw new BadRequestException(
          'Upload NIC and driving licence photos before marking handed over',
        );
      }
    }
    const updated = await this.applyStatus(
      booking,
      dto.status,
      actorId,
      dto.cancelReason?.trim(),
    );
    return this.toAdminView(updated);
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

    if (next === BookingStatus.CONFIRMED) {
      await this.safeSendMail('confirmed', updated);
      await this.notifyBooking(
        updated,
        'Booking confirmed',
        `Your ${updated.vehicle.brand} ${updated.vehicle.model} booking is confirmed.`,
      );
    } else if (next === BookingStatus.HANDED_OVER) {
      await this.notifyBooking(
        updated,
        'Vehicle handed over',
        `Enjoy your ${updated.vehicle.brand} ${updated.vehicle.model}. Drive safe.`,
      );
    } else if (next === BookingStatus.CANCELLED) {
      await this.safeSendMail('cancelled', updated);
      await this.notifyBooking(
        updated,
        'Booking cancelled',
        `Your ${updated.vehicle.brand} ${updated.vehicle.model} booking was cancelled.`,
      );
    } else if (next === BookingStatus.COMPLETED) {
      await this.safeSendMail('completed', updated);
      await this.notifyBooking(
        updated,
        'Rental completed',
        `Thanks for renting with VRentNow. You can leave a review on your booking.`,
      );
    }

    return updated;
  }

  private async notifyBooking(
    booking: BookingWithRelations,
    title: string,
    message: string,
  ): Promise<void> {
    await this.notifications.notify(booking.userId, title, message);
  }

  private async assertReadyFile(fileId: string): Promise<void> {
    if (!fileId) return;
    await this.files.getWithUrl(fileId);
  }

  private async resolveUrl(fileId: string | null): Promise<string | null> {
    if (!fileId) return null;
    try {
      const asset = await this.files.getWithUrl(fileId);
      return asset.accessUrl;
    } catch {
      return null;
    }
  }

  private async toAdminView(
    booking: BookingWithRelations,
  ): Promise<BookingAdminView> {
    const [nicUrl, licenceUrl, agreementUrl] = await Promise.all([
      this.resolveUrl(booking.nicFileId),
      this.resolveUrl(booking.licenceFileId),
      this.resolveUrl(booking.agreementFileId),
    ]);
    return { ...booking, nicUrl, licenceUrl, agreementUrl };
  }

  private async toCustomerView(
    booking: BookingWithRelations,
  ): Promise<BookingCustomerView> {
    const {
      nicFileId: _n,
      licenceFileId: _l,
      agreementFileId: _a,
      ...rest
    } = booking;
    const agreementUrl = await this.resolveUrl(booking.agreementFileId);
    return { ...rest, agreementUrl };
  }

  private bookingMailData(booking: BookingWithRelations): BookingMailData {
    const webUrl = (
      this.config.get<string>('APP_WEB_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');
    const amount = Number(booking.totalAmount);
    const totalAmount = Number.isFinite(amount)
      ? new Intl.NumberFormat('en-LK', {
          style: 'currency',
          currency: 'LKR',
          maximumFractionDigits: 0,
        }).format(amount)
      : String(booking.totalAmount);

    return {
      name: booking.firstName || booking.user.username,
      bookingId: booking.id,
      vehicleName: `${booking.vehicle.brand} ${booking.vehicle.model}`,
      pickupDate: booking.pickupDate.toISOString().slice(0, 10),
      returnDate: booking.returnDate.toISOString().slice(0, 10),
      totalAmount,
      bookingUrl: `${webUrl}/bookings/${booking.id}`,
      pickupLocation: booking.pickupLocation,
      cancelReason: booking.cancelReason ?? undefined,
    };
  }

  private async safeSendMail(
    kind: 'paid' | 'confirmed' | 'cancelled' | 'completed',
    booking: BookingWithRelations,
  ): Promise<void> {
    const to = booking.email;
    const data = this.bookingMailData(booking);
    try {
      if (kind === 'paid') await this.mail.sendBookingPaid(to, data);
      else if (kind === 'confirmed')
        await this.mail.sendBookingConfirmed(to, data);
      else if (kind === 'cancelled')
        await this.mail.sendBookingCancelled(to, data);
      else await this.mail.sendBookingCompleted(to, data);
    } catch (err) {
      this.logger.error(
        `Failed to send booking-${kind} email for ${booking.id}`,
        err as Error,
      );
    }
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
