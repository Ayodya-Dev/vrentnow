import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { BookingStatus, VehicleStatus } from '@prisma/client';
import { VehiclesService } from './vehicles.service';
import { ACTIVE_BOOKING_STATUSES } from '../bookings/active-booking-statuses';

describe('VehiclesService.listAvailable date filter', () => {
  let repo: {
    findMany: jest.Mock;
    count: jest.Mock;
  };
  let svc: VehiclesService;

  beforeEach(() => {
    repo = {
      findMany: jest.fn(async () => [] as unknown[]),
      count: jest.fn(async () => 0),
    };
    const categories = {} as never;
    const audit = {} as never;
    const files = { resolvePublicUrls: jest.fn(async () => [] as string[]) } as never;
    svc = new VehiclesService(repo as never, categories, audit, files);
  });

  it('does not filter by bookings when from/to are omitted', async () => {
    await svc.listAvailable({ page: 1, limit: 12 } as never);

    expect(repo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        deletedAt: null,
        status: VehicleStatus.AVAILABLE,
      }),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    const where = repo.findMany.mock.calls[0]![0] as Record<string, unknown>;
    expect(where.bookings).toBeUndefined();
  });

  it('rejects when only from is provided', async () => {
    await expect(
      svc.listAvailable({ page: 1, limit: 12, from: '2026-08-10' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when only to is provided', async () => {
    await expect(
      svc.listAvailable({ page: 1, limit: 12, to: '2026-08-12' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when to is before from', async () => {
    await expect(
      svc.listAvailable({
        page: 1,
        limit: 12,
        from: '2026-08-12',
        to: '2026-08-10',
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('excludes vehicles with overlapping active bookings', async () => {
    await svc.listAvailable({
      page: 1,
      limit: 12,
      from: '2026-08-10',
      to: '2026-08-12',
    } as never);

    const where = repo.findMany.mock.calls[0]![0] as {
      bookings: {
        none: {
          status: { in: BookingStatus[] };
          pickupDate: { lte: Date };
          returnDate: { gte: Date };
        };
      };
    };

    expect(where.bookings.none.status.in).toEqual(ACTIVE_BOOKING_STATUSES);
    expect(where.bookings.none.pickupDate.lte.toISOString()).toBe(
      '2026-08-12T00:00:00.000Z',
    );
    expect(where.bookings.none.returnDate.gte.toISOString()).toBe(
      '2026-08-10T00:00:00.000Z',
    );
  });
});
