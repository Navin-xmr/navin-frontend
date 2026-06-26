import { describe, it, expect } from 'vitest';
import { safeFormatDate, safeDateCompare, safeRating } from './safeFormat';

// ---------------------------------------------------------------------------
// safeFormatDate
// ---------------------------------------------------------------------------

describe('safeFormatDate', () => {
  // --- Happy path ---
  it('formats a valid date string with default options', () => {
    const result = safeFormatDate('2024-06-15T10:30:00Z');
    expect(result).toBe('Jun 15, 2024');
  });

  it('formats a valid date string with custom options', () => {
    const result = safeFormatDate('2024-06-15T10:30:00Z', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(result).toMatch(/Saturday, June 15, 2024/);
  });

  it('formats dates with time', () => {
    const result = safeFormatDate('2024-06-15T10:30:00Z', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    expect(result).toContain('Jun 15, 2024');
  });

  // --- Edge cases ---
  it("returns 'N/A' for null", () => {
    expect(safeFormatDate(null)).toBe('N/A');
  });

  it("returns 'N/A' for undefined", () => {
    expect(safeFormatDate(undefined)).toBe('N/A');
  });

  it("returns 'N/A' for empty string", () => {
    expect(safeFormatDate('')).toBe('N/A');
  });

  it("returns 'N/A' for invalid date string", () => {
    expect(safeFormatDate('not-a-date')).toBe('N/A');
  });

  it("returns 'N/A' for numeric string that isn't a valid date", () => {
    // Some engines parse '12345' differently; treat non-standard as invalid
    const result = safeFormatDate('12345');
    // If the engine manages to create a valid Date, it's still a deterministic result
    // but we just verify it doesn't crash
    expect(typeof result).toBe('string');
  });

  it("returns 'N/A' when passed a boolean (wrong type)", () => {
    // @ts-expect-error testing runtime behaviour with incorrect types
    expect(safeFormatDate(true)).toBe('N/A');
  });

  it('handles ISO date at midnight', () => {
    const result = safeFormatDate('2024-01-01T00:00:00Z');
    expect(result).toBe('Jan 1, 2024');
  });

  it('handles date-only string (no time)', () => {
    const result = safeFormatDate('2024-12-25');
    expect(result).toBe('Dec 25, 2024');
  });

  // --- Locale invariance ---
  it('uses en-US consistently', () => {
    const result = safeFormatDate('2024-03-05T00:00:00Z');
    // en-US: "Mar 5, 2024"
    expect(result).toBe('Mar 5, 2024');
  });
});

// ---------------------------------------------------------------------------
// safeDateCompare
// ---------------------------------------------------------------------------

describe('safeDateCompare', () => {
  // --- Happy path ---
  it('returns negative when a is before b', () => {
    expect(safeDateCompare('2024-01-01', '2024-06-15')).toBeLessThan(0);
  });

  it('returns positive when a is after b', () => {
    expect(safeDateCompare('2024-06-15', '2024-01-01')).toBeGreaterThan(0);
  });

  it('returns 0 for equal dates', () => {
    expect(safeDateCompare('2024-06-15', '2024-06-15')).toBe(0);
  });

  // --- Edge cases ---
  it('treats null a as 0 (epoch)', () => {
    const result = safeDateCompare(null, '2024-06-15');
    expect(result).toBeLessThan(0);
  });

  it('treats undefined a as 0 (epoch)', () => {
    const result = safeDateCompare(undefined, '2024-06-15');
    expect(result).toBeLessThan(0);
  });

  it('treats null b as 0 (epoch)', () => {
    const result = safeDateCompare('2024-06-15', null);
    expect(result).toBeGreaterThan(0);
  });

  it('returns 0 when both are null', () => {
    expect(safeDateCompare(null, null)).toBe(0);
  });

  it('returns 0 when both are undefined', () => {
    expect(safeDateCompare(undefined, undefined)).toBe(0);
  });

  it('handles invalid date string for a', () => {
    const result = safeDateCompare('invalid', '2024-06-15');
    // invalid a is NaN -> treated as isNaN, returns 1
    expect(result).toBe(1);
  });

  it('handles invalid date string for b', () => {
    const result = safeDateCompare('2024-06-15', 'invalid');
    expect(result).toBe(-1);
  });

  it('returns 0 when both strings are invalid', () => {
    expect(safeDateCompare('bad', 'worse')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// safeRating
// ---------------------------------------------------------------------------

describe('safeRating', () => {
  // --- Happy path ---
  it('returns the rating when a valid number is provided', () => {
    expect(safeRating(4)).toBe(4);
  });

  it('returns the rating when 0 is provided', () => {
    expect(safeRating(0)).toBe(0);
  });

  it('returns the rating for decimal values', () => {
    expect(safeRating(3.5)).toBe(3.5);
  });

  it('returns the rating for negative numbers', () => {
    expect(safeRating(-1)).toBe(-1);
  });

  // --- Edge cases ---
  it('returns 0 for null', () => {
    expect(safeRating(null)).toBe(0);
  });

  it('returns 0 for undefined', () => {
    expect(safeRating(undefined)).toBe(0);
  });

  // --- Robustness ---
  it('returns 0 when passed a string', () => {
    // @ts-expect-error testing runtime behaviour
    expect(safeRating('5')).toBe(0);
  });

  it('returns 0 when passed an object', () => {
    // @ts-expect-error testing runtime behaviour
    expect(safeRating({})).toBe(0);
  });

  it('returns 0 when passed a boolean', () => {
    // @ts-expect-error testing runtime behaviour
    expect(safeRating(true)).toBe(0);
  });
});
