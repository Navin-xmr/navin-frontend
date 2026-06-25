import { describe, it, expect } from 'vitest';
import { getStatusDisplayLabel, getStatusBadgeClass, getStatusDotClass } from '../utils/shipmentStatus';

// ---------------------------------------------------------------------------
// getStatusDisplayLabel
// ---------------------------------------------------------------------------

describe('getStatusDisplayLabel', () => {
    // --- Happy path ---
    it('returns correct display labels for all backend enums', () => {
        expect(getStatusDisplayLabel('CREATED')).toBe('Pending Approval');
        expect(getStatusDisplayLabel('IN_TRANSIT')).toBe('In Transit');
        expect(getStatusDisplayLabel('DELIVERED')).toBe('Delivered');
        expect(getStatusDisplayLabel('CANCELLED')).toBe('Cancelled');
    });

    // --- Edge cases ---
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

    it('returns the raw string for a lowercase input (case-sensitive lookup)', () => {
        expect(getStatusDisplayLabel('created')).toBe('created');
    });
});

// ---------------------------------------------------------------------------
// getStatusBadgeClass
// ---------------------------------------------------------------------------

describe('getStatusBadgeClass', () => {
    it('returns badge class strings containing expected color tokens', () => {
        expect(getStatusBadgeClass('CREATED')).toContain('#f59e0b');
        expect(getStatusBadgeClass('IN_TRANSIT')).toContain('#3b82f6');
        expect(getStatusBadgeClass('DELIVERED')).toContain('#10b981');
        expect(getStatusBadgeClass('CANCELLED')).toContain('#ef4444');
    });

    it('returns a fallback class for unknown status', () => {
        const fallback = getStatusBadgeClass('UNKNOWN_STATUS');
        expect(fallback).toContain('bg-text-secondary/10');
    });

    it('returns a fallback class for empty string', () => {
        const fallback = getStatusBadgeClass('');
        expect(fallback).toContain('bg-text-secondary/10');
    });
});

// ---------------------------------------------------------------------------
// getStatusDotClass
// ---------------------------------------------------------------------------

describe('getStatusDotClass', () => {
    it('returns dot classes for statuses', () => {
        expect(getStatusDotClass('CREATED')).toContain('#f59e0b');
        expect(getStatusDotClass('IN_TRANSIT')).toContain('#3b82f6');
        expect(getStatusDotClass('DELIVERED')).toContain('#10b981');
        expect(getStatusDotClass('CANCELLED')).toContain('#ef4444');
    });

    it('returns a fallback class for unknown status', () => {
        expect(getStatusDotClass('UNKNOWN_STATUS')).toBe('bg-text-secondary');
    });

    it('returns a fallback class for empty string', () => {
        expect(getStatusDotClass('')).toBe('bg-text-secondary');
    });
});
