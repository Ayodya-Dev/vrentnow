import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  PaymentStatus,
  Prisma,
  VehicleStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ACTIVE_BOOKING_STATUSES } from '../bookings/active-booking-statuses';

const BOOKING_STATUSES = Object.values(BookingStatus);
const VEHICLE_STATUSES = Object.values(VehicleStatus);

export type MonthlyPoint = {
  month: string;
  label: string;
  revenue: string;
  bookings: number;
};

export type RecentBooking = {
  id: string;
  firstName: string;
  lastName: string;
  pickupDate: Date;
  status: BookingStatus;
  totalAmount: Prisma.Decimal;
  vehicle: { brand: string; model: string; name: string };
};

export type DashboardStats = {
  bookingsByStatus: Record<BookingStatus, number>;
  activeBookings: number;
  vehiclesByStatus: Record<VehicleStatus, number>;
  revenuePaidTotal: string;
  revenuePaidThisMonth: string;
  bookingsCreatedToday: number;
  overdueRentals: number;
  monthly: MonthlyPoint[];
  recentBookings: RecentBooking[];
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const months = lastNMonths(now, 6);
    const seriesStart = months[0]!.start;

    const [
      bookingGroups,
      vehicleGroups,
      revenueTotal,
      revenueMonth,
      bookingsCreatedToday,
      overdueRentals,
      paidInWindow,
      bookingsInWindow,
      recentBookings,
    ] = await Promise.all([
      this.prisma.booking.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.vehicle.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.PAID,
          paidAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.booking.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.HANDED_OVER,
          returnDate: { lt: startOfToday },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.PAID,
          paidAt: { gte: seriesStart },
        },
        select: { amount: true, paidAt: true },
      }),
      this.prisma.booking.findMany({
        where: { createdAt: { gte: seriesStart } },
        select: { createdAt: true },
      }),
      this.prisma.booking.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          pickupDate: true,
          status: true,
          totalAmount: true,
          vehicle: { select: { brand: true, model: true, name: true } },
        },
      }),
    ]);

    const bookingsByStatus = zeroCounts(BOOKING_STATUSES);
    for (const row of bookingGroups) {
      bookingsByStatus[row.status] = row._count._all;
    }

    const vehiclesByStatus = zeroCounts(VEHICLE_STATUSES);
    for (const row of vehicleGroups) {
      vehiclesByStatus[row.status] = row._count._all;
    }

    const activeBookings = ACTIVE_BOOKING_STATUSES.reduce(
      (sum, status) => sum + bookingsByStatus[status],
      0,
    );

    const revenueByMonth = new Map<string, number>();
    const bookingsByMonth = new Map<string, number>();
    for (const m of months) {
      revenueByMonth.set(m.key, 0);
      bookingsByMonth.set(m.key, 0);
    }
    for (const payment of paidInWindow) {
      if (!payment.paidAt) continue;
      const key = monthKey(payment.paidAt);
      if (revenueByMonth.has(key)) {
        revenueByMonth.set(
          key,
          (revenueByMonth.get(key) ?? 0) + Number(payment.amount),
        );
      }
    }
    for (const booking of bookingsInWindow) {
      const key = monthKey(booking.createdAt);
      if (bookingsByMonth.has(key)) {
        bookingsByMonth.set(key, (bookingsByMonth.get(key) ?? 0) + 1);
      }
    }

    const monthly: MonthlyPoint[] = months.map((m) => ({
      month: m.key,
      label: m.label,
      revenue: String(revenueByMonth.get(m.key) ?? 0),
      bookings: bookingsByMonth.get(m.key) ?? 0,
    }));

    return {
      bookingsByStatus,
      activeBookings,
      vehiclesByStatus,
      revenuePaidTotal: decimalToString(revenueTotal._sum.amount),
      revenuePaidThisMonth: decimalToString(revenueMonth._sum.amount),
      bookingsCreatedToday,
      overdueRentals,
      monthly,
      recentBookings,
    };
  }
}

function zeroCounts<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<T, number>;
}

function decimalToString(value: Prisma.Decimal | null | undefined): string {
  if (value == null) return '0';
  return value.toString();
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function lastNMonths(
  now: Date,
  n: number,
): { key: string; label: string; start: Date }[] {
  const out: { key: string; label: string; start: Date }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    out.push({
      key: monthKey(d),
      label: d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
      start: d,
    });
  }
  return out;
}
