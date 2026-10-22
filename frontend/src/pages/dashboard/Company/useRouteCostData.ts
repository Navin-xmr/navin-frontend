import { useState, useEffect } from 'react';
import { shipmentApi } from '@services/api/endpoints/shipments';
import type { RouteCostData } from '../../../components/dashboard/CostPerRouteWidget/types';

export interface RouteMetrics {
  base: number;
  fuel: number;
  customs: number;
  insurance: number;
  revenue: number;
}

const asNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

/**
 * Reads the cost and revenue figures a shipment actually recorded in its
 * off-chain metadata. Returns null when it recorded none of them, so that
 * shipment is left out instead of being filled with invented numbers. On a
 * shipment that recorded at least one figure, any figure it did not record
 * counts as 0.
 */
export function readRouteMetrics(meta: Record<string, unknown>): RouteMetrics | null {
  const base = asNumber(meta.baseCost);
  const fuel = asNumber(meta.fuelCost);
  const customs = asNumber(meta.customsCost);
  const insurance = asNumber(meta.insuranceCost);
  const revenue = asNumber(meta.revenue);

  if ([base, fuel, customs, insurance, revenue].every((value) => value === undefined)) return null;

  return {
    base: base ?? 0,
    fuel: fuel ?? 0,
    customs: customs ?? 0,
    insurance: insurance ?? 0,
    revenue: revenue ?? 0,
  };
}

export interface UseRouteCostDataReturn {
  routeCostData: RouteCostData[];
  routeCostError: string | null;
  isLoading: boolean;
}

/**
 * Fetches all shipments and aggregates per-route cost data for the
 * CostPerRouteWidget. Extracted from CompanyDashboard to keep the
 * page component focused on layout and orchestration only.
 */
export function useRouteCostData(refreshKey: number): UseRouteCostDataReturn {
  const [routeCostData, setRouteCostData] = useState<RouteCostData[]>([]);
  const [routeCostError, setRouteCostError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setRouteCostError(null);

      try {
        const response = await shipmentApi.getAll({ limit: 100 });
        if (cancelled) return;

        const shipments = response.data ?? [];
        const routeMap = new Map<string, RouteCostData>();

        for (const s of shipments) {
          const origin = s.origin?.trim() || 'Unknown Origin';
          const destination = s.destination?.trim() || 'Unknown Destination';
          const routeKey = `${origin} → ${destination}`;

          const metrics = readRouteMetrics((s.offChainMetadata ?? {}) as Record<string, unknown>);
          if (!metrics) continue;
          const { base, fuel, customs, insurance, revenue } = metrics;
          const cost = base + fuel + customs + insurance;

          const shipmentItem = {
            id: s.id || s._id,
            trackingNumber: s.trackingNumber || s.id || s._id,
            cost,
            revenue,
          };

          const existing = routeMap.get(routeKey);
          if (!existing) {
            routeMap.set(routeKey, {
              route: routeKey,
              origin,
              destination,
              base,
              fuel,
              customs,
              insurance,
              revenue,
              shipments: [shipmentItem],
            });
          } else {
            existing.base += base;
            existing.fuel += fuel;
            existing.customs += customs;
            existing.insurance += insurance;
            existing.revenue += revenue;
            existing.shipments.push(shipmentItem);
          }
        }

        setRouteCostData(Array.from(routeMap.values()));
      } catch {
        if (cancelled) return;
        setRouteCostError('Failed to load route cost data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchData();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return { routeCostData, routeCostError, isLoading };
}
