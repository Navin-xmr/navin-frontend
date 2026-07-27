import type { RouteCostData } from './mockCostPerRouteData';

export const COST_SEGMENTS = [
  { key: 'base', label: 'Base', color: '#3b82f6' },
  { key: 'fuel', label: 'Fuel', color: '#f59e0b' },
  { key: 'customs', label: 'Customs', color: '#8b5cf6' },
  { key: 'insurance', label: 'Insurance', color: '#10b981' },
] as const;

export type CostSegmentKey = (typeof COST_SEGMENTS)[number]['key'];

export function getRouteTotalCost(route: RouteCostData): number {
  return route.base + route.fuel + route.customs + route.insurance;
}

export function getRouteMarginPercent(route: RouteCostData): number {
  if (route.revenue <= 0) return 0;
  return ((route.revenue - getRouteTotalCost(route)) / route.revenue) * 100;
}

export function getMarginColorClass(margin: number): string {
  if (margin > 20) return 'text-[#10b981]';
  if (margin >= 10) return 'text-[#f59e0b]';
  return 'text-[#ef4444]';
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function toChartRow(route: RouteCostData) {
  return {
    route: route.route,
    routeKey: route.route,
    base: route.base,
    fuel: route.fuel,
    customs: route.customs,
    insurance: route.insurance,
    totalCost: getRouteTotalCost(route),
    revenue: route.revenue,
    margin: getRouteMarginPercent(route),
  };
}
