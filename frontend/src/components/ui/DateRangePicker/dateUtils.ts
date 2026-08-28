/**
 * Minimal native `Date` helpers for {@link DateRangePicker}, replacing the
 * handful of `date-fns` functions the component previously imported. The rest
 * of the app already relies on native `Intl`/`Date` (see `utils/localeFormat`),
 * so this keeps a single date-handling idiom and drops the `date-fns` dep.
 *
 * All helpers operate in local time and return new `Date` instances, matching
 * `date-fns`'s default behavior (including month-end clamping in `addMonths`).
 */

/**
 * Add `amount` calendar months, clamping the day to the last day of the target
 * month so e.g. Jan 31 + 1 month === Feb 28 (Feb 29 in a leap year), exactly
 * like `date-fns/addMonths`. Time-of-day is preserved.
 */
export const addMonths = (date: Date, amount: number): Date => {
  const result = new Date(date.getTime());
  const day = result.getDate();
  // Shift the month from the 1st so an overflowing day never rolls into the
  // following month, then clamp back to the desired day.
  result.setDate(1);
  result.setMonth(result.getMonth() + amount);
  const daysInTargetMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(day, daysInTargetMonth));
  return result;
};

/** Subtract `amount` calendar months (see {@link addMonths}). */
export const subMonths = (date: Date, amount: number): Date =>
  addMonths(date, -amount);

/** Subtract `amount` days. Time-of-day is preserved. */
export const subDays = (date: Date, amount: number): Date => {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() - amount);
  return result;
};

/** First day of `date`'s month, at 00:00:00.000 local time. */
export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

/** Last day of `date`'s month, at 23:59:59.999 local time. */
export const endOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

/** `date` at 00:00:00.000 local time. */
export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** `date` at 23:59:59.999 local time. */
export const endOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

/** True when both dates fall on the same calendar day (local time). */
export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** True when `date` is strictly before `dateToCompare`. */
export const isBefore = (date: Date, dateToCompare: Date): boolean =>
  date.getTime() < dateToCompare.getTime();

/** True when `date` is strictly after `dateToCompare`. */
export const isAfter = (date: Date, dateToCompare: Date): boolean =>
  date.getTime() > dateToCompare.getTime();

/**
 * True when `date` is within `[start, end]` inclusive. Callers are responsible
 * for passing `start <= end` (matching how the component already orders them).
 */
export const isWithinInterval = (
  date: Date,
  interval: { start: Date; end: Date },
): boolean => {
  const time = date.getTime();
  return time >= interval.start.getTime() && time <= interval.end.getTime();
};
