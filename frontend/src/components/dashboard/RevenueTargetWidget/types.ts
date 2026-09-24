export interface DailyRevenue {
  date: string;
  amount: number;
}

export interface RevenueTargetData {
  actual: number;
  target: number;
  dailyRevenue: DailyRevenue[];
}
