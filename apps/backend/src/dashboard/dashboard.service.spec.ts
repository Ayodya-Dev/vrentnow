import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BookingStatus, PaymentStatus, VehicleStatus } from '@prisma/client';
import { DashboardService } from './dashboard.service';

describe('DashboardService.getStats', () => {
  let prisma: {
    booking: { groupBy: jest.Mock; count: jest.Mock; findMany: jest.Mock };
    vehicle: { groupBy: jest.Mock };
    payment: { aggregate: jest.Mock; findMany: jest.Mock };
  };
  let svc: DashboardService;

  beforeEach(() => {
    prisma = {
      booking: {
        groupBy: jest.fn(async () => [
          { status: BookingStatus.PENDING, _count: { _all: 2 } },
          { status: BookingStatus.CONFIRMED, _count: { _all: 1 } },
          { status: BookingStatus.HANDED_OVER, _count: { _all: 3 } },
          { status: BookingStatus.COMPLETED, _count: { _all: 4 } },
        ]),
        count: jest.fn(async () => 1),
        findMany: jest.fn(async () => []),
      },
      vehicle: {
        groupBy: jest.fn(async () => [
          { status: VehicleStatus.AVAILABLE, _count: { _all: 5 } },
          { status: VehicleStatus.RENTED, _count: { _all: 2 } },
          { status: VehicleStatus.MAINTENANCE, _count: { _all: 1 } },
        ]),
      },
      payment: {
        aggregate: jest.fn(async () => ({
          _sum: { amount: { toString: () => '15000' } },
        })),
        findMany: jest.fn(async () => []),
      },
    };
    svc = new DashboardService(prisma as never);
  });

  it('aggregates booking/vehicle counts, revenue, and series', async () => {
    const stats = await svc.getStats();

    expect(stats.activeBookings).toBe(6);
    expect(stats.bookingsByStatus.PENDING).toBe(2);
    expect(stats.bookingsByStatus.CANCELLED).toBe(0);
    expect(stats.vehiclesByStatus.AVAILABLE).toBe(5);
    expect(stats.revenuePaidTotal).toBe('15000');
    expect(stats.revenuePaidThisMonth).toBe('15000');
    expect(stats.bookingsCreatedToday).toBe(1);
    expect(stats.overdueRentals).toBe(1);
    expect(stats.monthly).toHaveLength(6);
    expect(stats.recentBookings).toEqual([]);

    expect(prisma.vehicle.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null } }),
    );
    expect(prisma.payment.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: PaymentStatus.PAID }),
      }),
    );
  });
});
