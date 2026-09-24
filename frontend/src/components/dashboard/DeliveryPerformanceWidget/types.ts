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
