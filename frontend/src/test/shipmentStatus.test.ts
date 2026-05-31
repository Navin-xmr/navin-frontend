import { describe, it, expect } from 'vitest';
import { getStatusDisplayLabel, getStatusBadgeClass, getStatusDotClass } from '../utils/shipmentStatus';

describe('shipmentStatus utility', () => {
    it('returns correct display labels for all backend enums', () => {
        expect(getStatusDisplayLabel('CREATED')).toBe('Pending Approval');
        expect(getStatusDisplayLabel('IN_TRANSIT')).toBe('In Transit');
        expect(getStatusDisplayLabel('DELIVERED')).toBe('Delivered');
        expect(getStatusDisplayLabel('CANCELLED')).toBe('Cancelled');
    });

    it('returns badge class strings containing expected color tokens', () => {
        expect(getStatusBadgeClass('CREATED')).toContain('#f59e0b');
        expect(getStatusBadgeClass('IN_TRANSIT')).toContain('#3b82f6');
        expect(getStatusBadgeClass('DELIVERED')).toContain('#10b981');
        expect(getStatusBadgeClass('CANCELLED')).toContain('#ef4444');
    });

    it('returns dot classes for statuses', () => {
        expect(getStatusDotClass('CREATED')).toContain('#f59e0b');
    });
});
