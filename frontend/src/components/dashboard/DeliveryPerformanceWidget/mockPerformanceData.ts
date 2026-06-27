/**
 * Mock data for the DeliveryPerformanceWidget.
 * Provides KPI summaries and 30-day trend series for each metric.
 */

export type TimePeriod = '7d' | '30d' | '90d';

export type KpiKey = 'onTimeRate' | 'avgDeliveryTime' | 'exceptionRate' | 'firstAttemptRate';

export interface KpiSummary {
  key: KpiKey;
  label: string;
  unit: string;
  current: number;
  previous: number;
  /** 30-day trend series (oldest -> newest). */
  trend: { date: string; value: number }[];
}

/**
 * Generate a deterministic-ish 30-day trend series around a baseline value.
 */
function generateTrend(baseline: number, variance: number, unit: string): { date: string; value: number }[] {
  const series: { date: string; value: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const noise = (Math.sin(i * 1.3) + Math.cos(i * 0.7)) * variance;
    let value = baseline + noise;
    if (unit === '%') value = Math.max(0, Math.min(100, Number(value.toFixed(1))));
    else value = Math.max(0, Number(value.toFixed(2)));
    series.push({ date: d.toISOString().slice(0, 10), value });
  }
  return series;
}

const ON_TIME_TREND = generateTrend(96, 3, '%');
const AVG_TIME_TREND = generateTrend(2.4, 0.4, 'days');
const EXCEPTION_TREND = generateTrend(4, 1.5, '%');
const FIRST_ATTEMPT_TREND = generateTrend(92, 2.5, '%');

export const MOCK_KPI_DATA: Record<TimePeriod, KpiSummary[]> = {
  '7d': [
    {
      key: 'onTimeRate',
      label: 'On-Time Delivery Rate',
      unit: '%',
      current: 96.2,
      previous: 94.8,
      trend: ON_TIME_TREND.slice(-7),
    },
    {
      key: 'avgDeliveryTime',
      label: 'Average Delivery Time',
      unit: 'days',
      current: 2.3,
      previous: 2.6,
      trend: AVG_TIME_TREND.slice(-7),
    },
    {
      key: 'exceptionRate',
      label: 'Exception Rate',
      unit: '%',
      current: 3.8,
      previous: 4.5,
      trend: EXCEPTION_TREND.slice(-7),
    },
    {
      key: 'firstAttemptRate',
      label: 'First Attempt Success Rate',
      unit: '%',
      current: 91.5,
      previous: 89.9,
      trend: FIRST_ATTEMPT_TREND.slice(-7),
    },
  ],
  '30d': [
    {
      key: 'onTimeRate',
      label: 'On-Time Delivery Rate',
      unit: '%',
      current: 95.4,
      previous: 93.1,
      trend: ON_TIME_TREND,
    },
    {
      key: 'avgDeliveryTime',
      label: 'Average Delivery Time',
      unit: 'days',
      current: 2.5,
      previous: 2.8,
      trend: AVG_TIME_TREND,
    },
    {
      key: 'exceptionRate',
      label: 'Exception Rate',
      unit: '%',
      current: 4.2,
      previous: 5.1,
      trend: EXCEPTION_TREND,
    },
    {
      key: 'firstAttemptRate',
      label: 'First Attempt Success Rate',
      unit: '%',
      current: 90.8,
      previous: 88.4,
      trend: FIRST_ATTEMPT_TREND,
    },
  ],
  '90d': [
    {
      key: 'onTimeRate',
      label: 'On-Time Delivery Rate',
      unit: '%',
      current: 94.1,
      previous: 92.0,
      trend: ON_TIME_TREND,
    },
    {
      key: 'avgDeliveryTime',
      label: 'Average Delivery Time',
      unit: 'days',
      current: 2.7,
      previous: 3.0,
      trend: AVG_TIME_TREND,
    },
    {
      key: 'exceptionRate',
      label: 'Exception Rate',
      unit: '%',
      current: 4.8,
      previous: 5.6,
      trend: EXCEPTION_TREND,
    },
    {
      key: 'firstAttemptRate',
      label: 'First Attempt Success Rate',
      unit: '%',
      current: 89.3,
      previous: 86.7,
      trend: FIRST_ATTEMPT_TREND,
    },
  ],
};

/**
 * Color status for the on-time rate KPI based on thresholds.
 */
export function getOnTimeStatusColor(value: number): 'green' | 'yellow' | 'red' {
  if (value > 95) return 'green';
  if (value >= 85) return 'yellow';
  return 'red';
}
