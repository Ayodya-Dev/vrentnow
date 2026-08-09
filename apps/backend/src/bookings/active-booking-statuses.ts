import { BookingStatus } from '@prisma/client';

/** Statuses that block a vehicle for overlapping date ranges. */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.HANDED_OVER,
];
