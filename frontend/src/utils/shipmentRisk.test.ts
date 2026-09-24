import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Shipment } from '../api/shipmentApi';
import { getShipmentRiskLevel, getShipmentRiskStyle } from './shipmentRisk';

const NOW = new Date('2026-09-24T12:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

function makeShipment(overrides: Partial<Shipment> & { ageMs: number }): Shipment {
  const { ageMs, ...rest } = overrides;
  return {
    id: 'shp-1',
    origin: 'Lagos',
    destination: 'Accra',
    status: 'IN_TRANSIT',
    createdAt: new Date(NOW.getTime() - ageMs).toISOString(),
    ...rest,
  };
}

describe('getShipmentRiskLevel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns normal for an in-transit shipment just under 10 days old', () => {
    expect(getShipmentRiskLevel(makeShipment({ ageMs: 10 * DAY_MS - 1 }))).toEqual({
      level: 'normal',
      label: '',
    });
  });

  it('returns at-risk for an in-transit shipment exactly 10 days old', () => {
    expect(getShipmentRiskLevel(makeShipment({ ageMs: 10 * DAY_MS }))).toEqual({
      level: 'at-risk',
      label: 'At Risk',
    });
  });

  it('returns at-risk for an in-transit shipment on the last day of the 14-day window', () => {
    expect(getShipmentRiskLevel(makeShipment({ ageMs: 15 * DAY_MS - 1 })).level).toBe('at-risk');
  });

  it('returns overdue with daysOverdue once an in-transit shipment passes 14 days', () => {
    expect(getShipmentRiskLevel(makeShipment({ ageMs: 15 * DAY_MS }))).toEqual({
      level: 'overdue',
      label: 'Overdue',
      daysOverdue: 1,
    });
    expect(getShipmentRiskLevel(makeShipment({ ageMs: 20 * DAY_MS })).daysOverdue).toBe(6);
  });

  it('returns at-risk for an URGENT shipment that is still open', () => {
    expect(
      getShipmentRiskLevel(makeShipment({ ageMs: DAY_MS, status: 'CREATED', priority: 'URGENT' })).level,
    ).toBe('at-risk');
  });

  it.each(['DELIVERED', 'CANCELLED'] as const)('returns normal for an URGENT %s shipment', (status) => {
    expect(getShipmentRiskLevel(makeShipment({ ageMs: 30 * DAY_MS, status, priority: 'URGENT' })).level).toBe(
      'normal',
    );
  });

  it('returns normal for an old shipment that is not in transit', () => {
    expect(getShipmentRiskLevel(makeShipment({ ageMs: 30 * DAY_MS, status: 'DELIVERED' })).level).toBe('normal');
  });
});

describe('getShipmentRiskStyle', () => {
  it('maps every risk level to its row classes', () => {
    expect(getShipmentRiskStyle('overdue')).toBe('border-l-4 border-l-red-500 bg-red-500/5');
    expect(getShipmentRiskStyle('at-risk')).toBe('border-l-4 border-l-amber-400 bg-amber-400/5');
    expect(getShipmentRiskStyle('normal')).toBe('');
  });
});
