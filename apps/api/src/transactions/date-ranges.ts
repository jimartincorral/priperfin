/**
 * Transaction dates are stored as UTC midnight, so every range boundary is
 * built in UTC too. Using the server's local time zone shifted transactions
 * dated the 1st into the previous month west of UTC.
 */

/** Start of the given UTC calendar day for a YYYY-MM-DD (or ISO) string. */
export function utcDayStart(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Midnight UTC of the day after the given YYYY-MM-DD (or ISO) string. */
export function utcNextDay(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1));
}

export function utcMonthRange(year: number, month: number) {
  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1)),
  };
}

export function utcYearRange(year: number) {
  return {
    gte: new Date(Date.UTC(year, 0, 1)),
    lt: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

/** The UTC month containing `now`, as {year, month (1-12)} plus its range. */
export function currentUtcMonth(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  return { year, month, ...utcMonthRange(year, month) };
}
