import { useCallback, useEffect, useRef, useState } from 'react';
import { shipmentApi } from '@services/api/endpoints/shipments';
import { realtimeService } from '@services/realtime/realtimeService';
import type { Shipment } from '@services/api/endpoints/shipments';
import type { ShipmentStatusEvent, MilestoneEvent } from '../types/realtimeEvents';

export interface UseShipmentDetailReturn {
  shipment: Shipment | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useShipmentDetail(id: string | undefined): UseShipmentDetailReturn {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(id);

  useEffect(() => {
    idRef.current = id;
  }, [id]);

  const refresh = useCallback(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    shipmentApi
      .getById(id)
      .then((data) => setShipment(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load shipment.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => { refresh(); }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

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

  return { shipment, isLoading, error, refresh };
}
