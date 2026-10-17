import { useCallback, useLayoutEffect, useReducer, useRef, useState } from 'react';
import {
  Virtualizer,
  elementScroll,
  observeElementOffset,
  observeElementRect,
} from '@tanstack/react-virtual';
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
  const [, rerender] = useReducer((count: number) => count + 1, 0);

  const [virtualizer] = useState(
    () =>
      new Virtualizer<HTMLDivElement, Element>({
        count: shipments.length,
        getScrollElement: () => null,
        estimateSize: () => ESTIMATED_ROW_HEIGHT,
        overscan: OVERSCAN,
        observeElementRect,
        observeElementOffset,
        scrollToFn: elementScroll,
        onChange: () => {
          rerender();
        },
      }),
  );

  virtualizer.setOptions({
    ...virtualizer.options,
    count: shipments.length,
  });

  useLayoutEffect(() => {
    virtualizer.setOptions({
      ...virtualizer.options,
      getScrollElement: () => parentRef.current,
    });
    return virtualizer._didMount();
  }, [virtualizer]);

  useLayoutEffect(() => {
    virtualizer.setOptions({
      ...virtualizer.options,
      count: shipments.length,
      getScrollElement: () => parentRef.current,
    });
    return virtualizer._willUpdate();
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

