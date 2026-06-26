import { describe, expect, it } from 'vitest';
import {
  getAchievementPercent,
  getGaugeColor,
  getProjectedEndOfMonthRevenue,
} from './revenueTargetUtils';

describe('revenueTargetUtils', () => {
  it('calculates achievement percent', () => {
    expect(getAchievementPercent(75000, 100000)).toBe(75);
    expect(getAchievementPercent(120000, 100000)).toBe(120);
  });

  it('returns gauge colors by threshold', () => {
    expect(getGaugeColor(120)).toBe('#10b981');
    expect(getGaugeColor(85)).toBe('#3b82f6');
    expect(getGaugeColor(60)).toBe('#f59e0b');
    expect(getGaugeColor(30)).toBe('#ef4444');
  });

  it('projects end-of-month revenue from daily run rate', () => {
    const projected = getProjectedEndOfMonthRevenue(50000, new Date(2026, 5, 15));
    expect(projected).toBe(100000);
  });
});
