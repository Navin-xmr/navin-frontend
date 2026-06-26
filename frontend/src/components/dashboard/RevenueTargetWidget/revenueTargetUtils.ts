export type GaugeColor = '#10b981' | '#3b82f6' | '#f59e0b' | '#ef4444';

export function getAchievementPercent(actual: number, target: number): number {
  if (target <= 0) return 0;
  return (actual / target) * 100;
}

export function getGaugeColor(percent: number): GaugeColor {
  if (percent >= 100) return '#10b981';
  if (percent >= 75) return '#3b82f6';
  if (percent >= 50) return '#f59e0b';
  return '#ef4444';
}

export function getProjectedEndOfMonthRevenue(
  actual: number,
  now = new Date(),
): number {
  const dayOfMonth = now.getDate();
  if (dayOfMonth <= 0) return actual;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return (actual / dayOfMonth) * daysInMonth;
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function buildSparklinePath(values: number[]): string {
  if (values.length === 0) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}
