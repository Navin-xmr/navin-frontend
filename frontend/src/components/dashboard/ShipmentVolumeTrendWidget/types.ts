export type TimeRange = '7d' | '30d' | '90d' | '12m';
export type Granularity = 'daily' | 'weekly' | 'monthly';

export interface TrendDataPoint {
  date: string;
  completed: number;
  cancelled: number;
}
