import { describe, expect, it } from 'vitest';
import {
  addMonths,
  subMonths,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  isSameDay,
  isBefore,
  isAfter,
  isWithinInterval,
} from './dateUtils';

const iso = (d: Date) => d.toISOString();

describe('dateUtils', () => {
  describe('addMonths', () => {
    it('adds months within the same year', () => {
      expect(iso(addMonths(new Date(2026, 0, 15), 1))).toBe(
        iso(new Date(2026, 1, 15)),
      );
    });

    it('rolls forward across a year boundary', () => {
      expect(iso(addMonths(new Date(2026, 10, 10), 3))).toBe(
        iso(new Date(2027, 1, 10)),
      );
    });

    it('rolls backward across a year boundary', () => {
      expect(iso(addMonths(new Date(2026, 1, 10), -3))).toBe(
        iso(new Date(2025, 10, 10)),
      );
    });

    it('clamps the day to the last day of a shorter target month', () => {
      // Jan 31 + 1 month -> Feb 28 (2026 is not a leap year)
      expect(iso(addMonths(new Date(2026, 0, 31), 1))).toBe(
        iso(new Date(2026, 1, 28)),
      );
      // Jan 31 + 1 month -> Feb 29 in a leap year
      expect(iso(addMonths(new Date(2028, 0, 31), 1))).toBe(
        iso(new Date(2028, 1, 29)),
      );
      // May 31 - 1 month -> Apr 30
      expect(iso(addMonths(new Date(2026, 4, 31), -1))).toBe(
        iso(new Date(2026, 3, 30)),
      );
    });

    it('preserves the time of day', () => {
      const result = addMonths(new Date(2026, 0, 15, 9, 30, 45, 123), 2);
      expect([
        result.getHours(),
        result.getMinutes(),
        result.getSeconds(),
        result.getMilliseconds(),
      ]).toEqual([9, 30, 45, 123]);
    });

    it('does not mutate its argument', () => {
      const input = new Date(2026, 0, 15);
      addMonths(input, 5);
      expect(iso(input)).toBe(iso(new Date(2026, 0, 15)));
    });
  });

  describe('subMonths', () => {
    it('is the inverse of addMonths', () => {
      expect(iso(subMonths(new Date(2026, 5, 20), 7))).toBe(
        iso(new Date(2025, 10, 20)),
      );
    });
  });

  describe('subDays', () => {
    it('crosses month and year boundaries', () => {
      expect(iso(subDays(new Date(2026, 0, 3), 6))).toBe(
        iso(new Date(2025, 11, 28)),
      );
    });
  });

  describe('start/end helpers', () => {
    it('startOfMonth returns the 1st at midnight', () => {
      expect(iso(startOfMonth(new Date(2026, 6, 17, 14, 5)))).toBe(
        iso(new Date(2026, 6, 1, 0, 0, 0, 0)),
      );
    });

    it('endOfMonth returns the last day at 23:59:59.999', () => {
      expect(iso(endOfMonth(new Date(2026, 1, 10)))).toBe(
        iso(new Date(2026, 1, 28, 23, 59, 59, 999)),
      );
      expect(iso(endOfMonth(new Date(2028, 1, 10)))).toBe(
        iso(new Date(2028, 1, 29, 23, 59, 59, 999)),
      );
    });

    it('startOfDay / endOfDay bracket the calendar day', () => {
      const d = new Date(2026, 2, 9, 13, 30);
      expect(iso(startOfDay(d))).toBe(iso(new Date(2026, 2, 9, 0, 0, 0, 0)));
      expect(iso(endOfDay(d))).toBe(iso(new Date(2026, 2, 9, 23, 59, 59, 999)));
    });
  });

  describe('comparison helpers', () => {
    it('isSameDay ignores the time component', () => {
      expect(isSameDay(new Date(2026, 0, 1, 0, 0), new Date(2026, 0, 1, 23, 59))).toBe(true);
      expect(isSameDay(new Date(2026, 0, 1), new Date(2026, 1, 1))).toBe(false);
      expect(isSameDay(new Date(2026, 0, 1), new Date(2025, 0, 1))).toBe(false);
    });

    it('isBefore / isAfter are strict', () => {
      const a = new Date(2026, 0, 1);
      const b = new Date(2026, 0, 2);
      expect(isBefore(a, b)).toBe(true);
      expect(isBefore(b, a)).toBe(false);
      expect(isBefore(a, a)).toBe(false);
      expect(isAfter(b, a)).toBe(true);
      expect(isAfter(a, b)).toBe(false);
      expect(isAfter(a, a)).toBe(false);
    });

    it('isWithinInterval is inclusive of both endpoints', () => {
      const start = new Date(2026, 0, 10);
      const end = new Date(2026, 0, 20);
      expect(isWithinInterval(start, { start, end })).toBe(true);
      expect(isWithinInterval(end, { start, end })).toBe(true);
      expect(isWithinInterval(new Date(2026, 0, 15), { start, end })).toBe(true);
      expect(isWithinInterval(new Date(2026, 0, 9), { start, end })).toBe(false);
      expect(isWithinInterval(new Date(2026, 0, 21), { start, end })).toBe(false);
    });
  });
});
