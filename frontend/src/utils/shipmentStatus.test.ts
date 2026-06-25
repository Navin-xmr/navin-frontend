import { describe, it, expect } from 'vitest';
import { getStatusDisplayLabel, getStatusBadgeClass, getStatusDotClass } from './shipmentStatus';

// ---------------------------------------------------------------------------
// getStatusDisplayLabel
// ---------------------------------------------------------------------------

describe('getStatusDisplayLabel', () => {
  it('returns correct display labels for all known statuses', () => {
    expect(getStatusDisplayLabel('CREATED')).toBe('Pending Approval');
    expect(getStatusDisplayLabel('IN_TRANSIT')).toBe('In Transit');
    expect(getStatusDisplayLabel('DELIVERED')).toBe('Delivered');
    expect(getStatusDisplayLabel('CANCELLED')).toBe('Cancelled');
  });

  it("returns 'Unknown' for empty string", () => {
    expect(getStatusDisplayLabel('')).toBe('Unknown');
  });

  it("returns 'Unknown' for null", () => {
    // @ts-expect-error testing runtime behaviour
    expect(getStatusDisplayLabel(null)).toBe('Unknown');
  });

  it("returns 'Unknown' for undefined", () => {
    // @ts-expect-error testing runtime behaviour
    expect(getStatusDisplayLabel(undefined)).toBe('Unknown');
  });

  it('returns the raw string for an unknown status', () => {
    expect(getStatusDisplayLabel('SOME_OTHER_STATUS')).toBe('SOME_OTHER_STATUS');
  });

  it('is case-sensitive — lowercase input returns raw string', () => {
    expect(getStatusDisplayLabel('created')).toBe('created');
    expect(getStatusDisplayLabel('delivered')).toBe('delivered');
  });
});

// ---------------------------------------------------------------------------
// getStatusBadgeClass
// ---------------------------------------------------------------------------

describe('getStatusBadgeClass', () => {
  it('returns CREATED badge class with amber color token', () => {
    expect(getStatusBadgeClass('CREATED')).toContain('#f59e0b');
  });

  it('returns IN_TRANSIT badge class with blue color token', () => {
    expect(getStatusBadgeClass('IN_TRANSIT')).toContain('#3b82f6');
  });

  it('returns DELIVERED badge class with green color token', () => {
    expect(getStatusBadgeClass('DELIVERED')).toContain('#10b981');
  });

  it('returns CANCELLED badge class with red color token', () => {
    expect(getStatusBadgeClass('CANCELLED')).toContain('#ef4444');
  });

  it('returns a fallback class for an unknown status', () => {
    expect(getStatusBadgeClass('UNKNOWN_STATUS')).toContain('bg-text-secondary/10');
  });

  it('returns a fallback class for empty string', () => {
    expect(getStatusBadgeClass('')).toContain('bg-text-secondary/10');
  });

  it('returns a string for every known status (no crashes)', () => {
    ['CREATED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].forEach((s) => {
      expect(typeof getStatusBadgeClass(s)).toBe('string');
    });
  });
});

// ---------------------------------------------------------------------------
// getStatusDotClass
// ---------------------------------------------------------------------------

describe('getStatusDotClass', () => {
  it('returns dot class for CREATED', () => {
    expect(getStatusDotClass('CREATED')).toContain('#f59e0b');
  });

  it('returns dot class for IN_TRANSIT', () => {
    expect(getStatusDotClass('IN_TRANSIT')).toContain('#3b82f6');
  });

  it('returns dot class for DELIVERED', () => {
    expect(getStatusDotClass('DELIVERED')).toContain('#10b981');
  });

  it('returns dot class for CANCELLED', () => {
    expect(getStatusDotClass('CANCELLED')).toContain('#ef4444');
  });

  it('returns fallback class for unknown status', () => {
    expect(getStatusDotClass('UNKNOWN_STATUS')).toBe('bg-text-secondary');
  });

  it('returns fallback class for empty string', () => {
    expect(getStatusDotClass('')).toBe('bg-text-secondary');
  });
});
