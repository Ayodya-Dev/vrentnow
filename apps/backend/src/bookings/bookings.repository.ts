import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    vehicle: {
      select: {
        id: true;
        name: true;
        slug: true;
        brand: true;
        model: true;
        pricePerDay: true;
        status: true;
      };
    };
    user: {
      select: { id: true; email: true; username: true };
    };
    payment: true;
  };
}>;

const ACTIVE_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.HANDED_OVER,
];

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly withRelations = {
    vehicle: {
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        model: true,
        pricePerDay: true,
        status: true,
      },
    },
    user: {
      select: { id: true, email: true, username: true },
    },
    payment: true,
  } as const;

  create(
    data: Prisma.BookingUncheckedCreateInput,
  ): Promise<BookingWithRelations> {
    return this.prisma.booking.create({
      data,
      include: this.withRelations,
    });
  }

  /** Create booking + pending payment in one transaction. */
  createWithPayment(params: {
    booking: Prisma.BookingUncheckedCreateInput;
    payment: Omit<Prisma.PaymentUncheckedCreateInput, 'bookingId'>;
  }): Promise<BookingWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: params.booking,
      });
      await tx.payment.create({
        data: {
          ...params.payment,
          bookingId: booking.id,
        },
      });
      return tx.booking.findUniqueOrThrow({
        where: { id: booking.id },
        include: this.withRelations,
      });
    });
  }

  update(
    id: string,
    data: Prisma.BookingUncheckedUpdateInput,
  ): Promise<BookingWithRelations> {
    return this.prisma.booking.update({
      where: { id },
      data,
      include: this.withRelations,
    });
  }

  findById(id: string): Promise<BookingWithRelations | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: this.withRelations,
    });
  }

  findMany(
    where: Prisma.BookingWhereInput,
    orderBy: Prisma.BookingOrderByWithRelationInput,
    skip: number,
    take: number,
  ): Promise<BookingWithRelations[]> {
    return this.prisma.booking.findMany({
      where,
      orderBy,
      skip,
      take,
      include: this.withRelations,
    });
  }

  count(where: Prisma.BookingWhereInput): Promise<number> {
    return this.prisma.booking.count({ where });
  }

  countOverlapping(params: {
    vehicleId: string;
    pickupDate: Date;
    returnDate: Date;
    excludeBookingId?: string;
  }): Promise<number> {
    const where: Prisma.BookingWhereInput = {
      vehicleId: params.vehicleId,
      status: { in: ACTIVE_STATUSES },
      pickupDate: { lte: params.returnDate },
      returnDate: { gte: params.pickupDate },
    };
    if (params.excludeBookingId) {
      where.id = { not: params.excludeBookingId };
    }
    return this.prisma.booking.count({ where });
  }

  countActiveForVehicle(vehicleId: string): Promise<number> {
    return this.prisma.booking.count({
      where: {
        vehicleId,
        status: { in: ACTIVE_STATUSES },
      },
    });
  }

  markPaymentPaid(bookingId: string, transactionId: string) {
    return this.prisma.payment.update({
      where: { bookingId },
      data: {
        status: 'PAID',
        transactionId,
        paidAt: new Date(),
      },
    });
  }
}
