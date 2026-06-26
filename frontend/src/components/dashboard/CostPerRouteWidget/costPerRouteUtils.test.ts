import { describe, expect, it } from 'vitest';
import { getMarginColorClass, getRouteMarginPercent, getRouteTotalCost } from './costPerRouteUtils';
import { MOCK_ROUTE_COST_DATA } from './mockCostPerRouteData';

describe('costPerRouteUtils', () => {
  it('calculates total cost and margin', () => {
    const route = MOCK_ROUTE_COST_DATA[0];
    expect(getRouteTotalCost(route)).toBe(7070);
    expect(getRouteMarginPercent(route)).toBeCloseTo(27.9, 1);
  });

  it('color-codes margin thresholds', () => {
    expect(getMarginColorClass(25)).toBe('text-[#10b981]');
    expect(getMarginColorClass(15)).toBe('text-[#f59e0b]');
    expect(getMarginColorClass(5)).toBe('text-[#ef4444]');
  });
});
