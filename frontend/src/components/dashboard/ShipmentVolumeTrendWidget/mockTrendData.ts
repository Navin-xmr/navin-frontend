/**
 * Mock data for the ShipmentVolumeTrendWidget.
 * Provides shipment volume trends with completed vs cancelled series
 * across different time ranges and granularities.
 */

export type TimeRange = '7d' | '30d' | '90d' | '12m';
export type Granularity = 'daily' | 'weekly' | 'monthly';

export interface TrendDataPoint {
  date: string;
  completed: number;
  cancelled: number;
}

/**
 * Simple seeded pseudo-random number generator (mulberry32)
 */
function createPRNG(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate daily shipment data
 */
function generateDailyData(days: number, seed: number): TrendDataPoint[] {
  const rand = createPRNG(seed);
  const data: TrendDataPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();

    // Add some upward trend and weekly seasonality
    const trendFactor = 1 + (days - i) / (days * 2);
    const weekDay = d.getDay();
    const weekdayBoost = weekDay >= 1 && weekDay <= 5 ? 1.2 : 0.7;

    const baseCompleted = Math.floor(rand() * 40 * trendFactor * weekdayBoost) + 20;
    const baseCancelled = Math.floor(rand() * 5) + 1;

    data.push({
      date: `${month} ${day}`,
      completed: baseCompleted,
      cancelled: baseCancelled,
    });
  }

  return data;
}

/**
 * Generate weekly shipment data
 */
function generateWeeklyData(weeks: number, seed: number): TrendDataPoint[] {
  const rand = createPRNG(seed);
  const data: TrendDataPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i * 7);

    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();

    // Weekly data is aggregated, so higher numbers
    const trendFactor = 1 + (weeks - i) / (weeks * 2);
    const baseCompleted = Math.floor(rand() * 200 * trendFactor) + 150;
    const baseCancelled = Math.floor(rand() * 25) + 5;

    data.push({
      date: `${month} ${day}`,
      completed: baseCompleted,
      cancelled: baseCancelled,
    });
  }

  return data;
}

/**
 * Generate monthly shipment data
 */
function generateMonthlyData(months: number, seed: number): TrendDataPoint[] {
  const rand = createPRNG(seed);
  const data: TrendDataPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(today.getMonth() - i);

    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();

    // Monthly data is aggregated even more
    const trendFactor = 1 + (months - i) / (months * 2);
    const baseCompleted = Math.floor(rand() * 800 * trendFactor) + 600;
    const baseCancelled = Math.floor(rand() * 80) + 20;

    data.push({
      date: `${month} ${year}`,
      completed: baseCompleted,
      cancelled: baseCancelled,
    });
  }

  return data;
}

/**
 * Mock data structure for all combinations of time ranges and granularities
 */
export const MOCK_TREND_DATA: Record<
  TimeRange,
  Record<Granularity, TrendDataPoint[]>
> = {
  '7d': {
    daily: generateDailyData(7, 100),
    weekly: generateWeeklyData(1, 101),
    monthly: generateMonthlyData(1, 102),
  },
  '30d': {
    daily: generateDailyData(30, 200),
    weekly: generateWeeklyData(4, 201),
    monthly: generateMonthlyData(1, 202),
  },
  '90d': {
    daily: generateDailyData(90, 300),
    weekly: generateWeeklyData(13, 301),
    monthly: generateMonthlyData(3, 302),
  },
  '12m': {
    daily: generateDailyData(365, 400),
    weekly: generateWeeklyData(52, 401),
    monthly: generateMonthlyData(12, 402),
  },
};
