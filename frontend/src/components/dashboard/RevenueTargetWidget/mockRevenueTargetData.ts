export interface DailyRevenue {
  date: string;
  amount: number;
}

export interface RevenueTargetData {
  actual: number;
  target: number;
  dailyRevenue: DailyRevenue[];
}

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildCurrentMonthDailyRevenue(now = new Date()): DailyRevenue[] {
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfMonth = now.getDate();
  const random = mulberry32(year * 100 + month + 1);
  const days: DailyRevenue[] = [];

  for (let day = 1; day <= dayOfMonth; day += 1) {
    const date = new Date(year, month, day);
    const amount = Math.round((4200 + random() * 2800) * 100) / 100;
    days.push({
      date: date.toISOString().slice(0, 10),
      amount,
    });
  }

  return days;
}

export function buildRevenueTargetData(now = new Date()): RevenueTargetData {
  const dailyRevenue = buildCurrentMonthDailyRevenue(now);
  const actual = dailyRevenue.reduce((sum, entry) => sum + entry.amount, 0);
  const target = 150000;

  return {
    actual,
    target,
    dailyRevenue,
  };
}

export const MOCK_REVENUE_TARGET_DATA = buildRevenueTargetData();
