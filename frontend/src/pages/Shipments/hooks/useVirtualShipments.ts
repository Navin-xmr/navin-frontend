import { useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Shipment } from '../../../api/shipmentApi';

const ESTIMATED_ROW_HEIGHT = 52;
const OVERSCAN = 5;
const LOAD_MORE_THRESHOLD_PX = 200;

interface UseVirtualShipmentsOptions {
  shipments: Shipment[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function useVirtualShipments({ shipments, onLoadMore, hasMore }: UseVirtualShipmentsOptions) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: shipments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  const handleScroll = useCallback(() => {
    const el = parentRef.current;
    if (!el || !onLoadMore || !hasMore) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < LOAD_MORE_THRESHOLD_PX) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore]);

  const scrollToIndex = useCallback(
    (index: number) => {
      virtualizer.scrollToIndex(index, { behavior: 'auto' });
    },
    [virtualizer],
  );

  return { parentRef, virtualizer, handleScroll, scrollToIndex };
}
