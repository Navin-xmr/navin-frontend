import { useCallback, useEffect, useRef, useState } from 'react';
import { shipmentApi } from '@services/api/endpoints/shipments';
import { realtimeService } from '@services/realtime/realtimeService';
import type { Shipment } from '@services/api/endpoints/shipments';
import type { ShipmentStatusEvent, MilestoneEvent } from '../types/realtimeEvents';

/** How often the open detail page re-reads the shipment / settlement state. */
export const SHIPMENT_POLL_INTERVAL_MS = 30_000;
/** Data older than this is flagged as stale to the user. */
export const SHIPMENT_STALE_AFTER_MS = 5 * 60_000;

export interface UseShipmentDetailOptions {
  pollIntervalMs?: number;
  staleAfterMs?: number;
}

export interface UseShipmentDetailReturn {
  shipment: Shipment | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  /** Epoch ms of the last successful fetch; null until the first one lands. */
  lastUpdatedAt: number | null;
  /** True when the last successful fetch is older than `staleAfterMs`. */
  isStale: boolean;
}

export function useShipmentDetail(
  id: string | undefined,
  options: UseShipmentDetailOptions = {},
): UseShipmentDetailReturn {
  const { pollIntervalMs = SHIPMENT_POLL_INTERVAL_MS, staleAfterMs = SHIPMENT_STALE_AFTER_MS } = options;
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  // Clock used to derive staleness; advanced by the poll timer and every fetch.
  const [now, setNow] = useState(0);
  const idRef = useRef(id);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    idRef.current = id;
  }, [id]);

  /**
   * A foreground load shows the loading state and surfaces errors. A background
   * (polling) load is silent: on failure the last good data stays on screen and
   * `isStale` tells the user once it is too old.
   */
  const load = useCallback(
    (background: boolean) => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      const requestId = ++latestRequestRef.current;
      if (!background) {
        setIsLoading(true);
        setError(null);
      }
      shipmentApi
        .getById(id)
        .then((data) => {
          if (requestId !== latestRequestRef.current) return;
          const fetchedAt = Date.now();
          setShipment(data);
          setError(null);
          setLastUpdatedAt(fetchedAt);
          setNow(fetchedAt);
        })
        .catch((err) => {
          if (requestId !== latestRequestRef.current || background) return;
          setError(err instanceof Error ? err.message : 'Unable to load shipment.');
        })
        .finally(() => {
          if (requestId === latestRequestRef.current) setIsLoading(false);
        });
    },
    [id],
  );

  const refresh = useCallback(() => load(false), [load]);

  useEffect(() => {
    const timer = setTimeout(() => { load(false); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  // Contract/settlement state can change while the page is open, so re-read it
  // periodically (and when the tab becomes visible again).
  useEffect(() => {
    if (!id || pollIntervalMs <= 0) return;
    const tick = () => {
      if (document.visibilityState === 'hidden') return;
      setNow(Date.now());
      load(true);
    };
    const timer = setInterval(tick, pollIntervalMs);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [id, load, pollIntervalMs]);

  useEffect(() => {
    const handleStatus = (ev: ShipmentStatusEvent) => {
      if (ev.shipmentId === idRef.current) refresh();
    };
    const handleMilestone = (ev: MilestoneEvent) => {
      if (ev.shipmentId === idRef.current) refresh();
    };

    realtimeService.subscribe('shipment:status', handleStatus);
    realtimeService.subscribe('shipment:milestone', handleMilestone);
    return () => {
      realtimeService.unsubscribe('shipment:status', handleStatus);
      realtimeService.unsubscribe('shipment:milestone', handleMilestone);
    };
  }, [refresh]);

  const isStale = lastUpdatedAt !== null && now - lastUpdatedAt > staleAfterMs;

  return { shipment, isLoading, error, refresh, lastUpdatedAt, isStale };
}
