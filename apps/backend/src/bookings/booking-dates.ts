/** Parse YYYY-MM-DD as a UTC calendar date (no local TZ shift). */
export function parseDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  if (!match) {
    throw new Error(`Invalid date: ${value}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Inclusive calendar days between pickup and return (same day = 1). */
export function rentalDays(pickup: Date, returnDate: Date): number {
  const ms = returnDate.getTime() - pickup.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
  return Math.max(days, 1);
}
