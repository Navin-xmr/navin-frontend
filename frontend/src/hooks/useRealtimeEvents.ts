import { useEffect, useRef, useState } from 'react';
import { realtimeService } from '@services/realtime/realtimeService';
import type { RealtimeEvent, RealtimeEventType } from '../types/realtimeEvents';

type EventForType<T extends RealtimeEventType> = Extract<RealtimeEvent, { type: T }>;

export function useRealtimeEvents<T extends RealtimeEventType>(
  eventTypes: T[],
): { [K in T]?: EventForType<K> } {
  const [latest, setLatest] = useState<{ [K in T]?: EventForType<K> }>({});
  const typesRef = useRef(eventTypes);

  useEffect(() => {
    const handlers: Array<{ type: T; fn: (ev: RealtimeEvent) => void }> = [];

    typesRef.current.forEach((eventType) => {
      const fn = (ev: RealtimeEvent) => {
        setLatest((prev) => ({ ...prev, [eventType]: ev as EventForType<typeof eventType> }));
      };
      realtimeService.subscribe(eventType, fn as Parameters<typeof realtimeService.subscribe>[1]);
      handlers.push({ type: eventType, fn });
    });

    return () => {
      handlers.forEach(({ type, fn }) => {
        realtimeService.unsubscribe(type, fn as Parameters<typeof realtimeService.unsubscribe>[1]);
      });
    };
  }, []);

  return latest;
}
