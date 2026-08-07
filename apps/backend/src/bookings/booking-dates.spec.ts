import { describe, expect, it } from '@jest/globals';
import { parseDateOnly, rentalDays } from './booking-dates';

describe('booking-dates', () => {
  it('parses YYYY-MM-DD as UTC midnight', () => {
    const d = parseDateOnly('2026-08-10');
    expect(d.toISOString()).toBe('2026-08-10T00:00:00.000Z');
  });

  it('counts inclusive rental days', () => {
    const pickup = parseDateOnly('2026-08-10');
    const same = parseDateOnly('2026-08-10');
    const two = parseDateOnly('2026-08-11');
    const three = parseDateOnly('2026-08-12');
    expect(rentalDays(pickup, same)).toBe(1);
    expect(rentalDays(pickup, two)).toBe(2);
    expect(rentalDays(pickup, three)).toBe(3);
  });
});
