import { useEffect, useRef, useState } from 'react';
import { realtimeService } from '@services/realtime/realtimeService';
import type { LocationUpdateEvent } from '../types/realtimeEvents';

export interface TrackingPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface ShipmentTrackingState {
  current: TrackingPoint | null;
  history: TrackingPoint[];
  lastUpdated: string | null;
}

export function useShipmentTracking(
  shipmentId: string | undefined,
  initialLocation?: TrackingPoint,
): ShipmentTrackingState {
  const [state, setState] = useState<ShipmentTrackingState>({
    current: initialLocation ?? null,
    history: initialLocation ? [initialLocation] : [],
    lastUpdated: initialLocation?.timestamp ?? null,
  });

  const shipmentIdRef = useRef(shipmentId);

  useEffect(() => {
    shipmentIdRef.current = shipmentId;
  }, [shipmentId]);

  useEffect(() => {
    const handler = (ev: LocationUpdateEvent) => {
      if (ev.shipmentId !== shipmentIdRef.current) return;
      const point: TrackingPoint = { lat: ev.lat, lng: ev.lng, timestamp: ev.timestamp };
      setState((prev) => ({
        current: point,
        history: [...prev.history, point],
        lastUpdated: ev.timestamp,
      }));
    };

    realtimeService.subscribe('location:update', handler);
    return () => {
      realtimeService.unsubscribe('location:update', handler);
    };
  }, []);

  return state;
}
