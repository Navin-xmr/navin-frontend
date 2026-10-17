import { useState, useEffect } from 'react';
import { shipmentApi } from '@services/api/endpoints/shipments';
import type { RouteCostData } from '../../../components/dashboard/CostPerRouteWidget/types';

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

          const meta = (s.offChainMetadata ?? {}) as Record<string, unknown>;
          const base = typeof meta.baseCost === 'number' ? meta.baseCost : 1200;
          const fuel = typeof meta.fuelCost === 'number' ? meta.fuelCost : 400;
          const customs = typeof meta.customsCost === 'number' ? meta.customsCost : 150;
          const insurance = typeof meta.insuranceCost === 'number' ? meta.insuranceCost : 100;
          const revenue = typeof meta.revenue === 'number' ? meta.revenue : 2500;
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
