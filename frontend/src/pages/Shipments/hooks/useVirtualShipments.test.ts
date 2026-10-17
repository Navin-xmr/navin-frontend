import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useVirtualShipments } from './useVirtualShipments';
import type { Shipment } from '../../../api/shipmentApi';

function createShipment(id: string): Shipment {
  return {
    id,
    origin: 'Lagos',
    destination: 'Abuja',
    status: 'IN_TRANSIT',
    createdAt: '2026-08-01T10:00:00.000Z',
  };
}

describe('useVirtualShipments', () => {
  it('initializes virtualizer with total size matching shipment count and row height', () => {
    const shipments = [createShipment('SHP-1'), createShipment('SHP-2'), createShipment('SHP-3')];

    const { result } = renderHook(() =>
      useVirtualShipments({
        shipments,
      }),
    );

    expect(result.current.parentRef.current).toBeNull();
    expect(result.current.virtualizer.getTotalSize()).toBe(3 * 52);
  });

  it('calls onLoadMore when scrolled within threshold and hasMore is true', () => {
    const onLoadMore = vi.fn();
    const shipments = [createShipment('SHP-1')];

    const { result } = renderHook(() =>
      useVirtualShipments({
        shipments,
        onLoadMore,
        hasMore: true,
      }),
    );

    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true });
    Object.defineProperty(container, 'scrollTop', { value: 350, configurable: true });
    result.current.parentRef.current = container;

    act(() => {
      result.current.handleScroll();
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('does not call onLoadMore when distance from bottom exceeds threshold or hasMore is false', () => {
    const onLoadMore = vi.fn();
    const shipments = [createShipment('SHP-1')];

    const { result, rerender } = renderHook(
      ({ hasMore }) =>
        useVirtualShipments({
          shipments,
          onLoadMore,
          hasMore,
        }),
      { initialProps: { hasMore: true } },
    );

    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true });
    Object.defineProperty(container, 'scrollTop', { value: 100, configurable: true });
    result.current.parentRef.current = container;

    act(() => {
      result.current.handleScroll();
    });
    expect(onLoadMore).not.toHaveBeenCalled();

    Object.defineProperty(container, 'scrollTop', { value: 400, configurable: true });
    rerender({ hasMore: false });

    act(() => {
      result.current.handleScroll();
    });
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('delegates scrollToIndex to virtualizer with auto behavior', () => {
    const shipments = [createShipment('SHP-1'), createShipment('SHP-2')];

    const { result } = renderHook(() =>
      useVirtualShipments({
        shipments,
      }),
    );

    const scrollToIndexSpy = vi
      .spyOn(result.current.virtualizer, 'scrollToIndex')
      .mockImplementation(() => {});

    act(() => {
      result.current.scrollToIndex(1);
    });

    expect(scrollToIndexSpy).toHaveBeenCalledWith(1, { behavior: 'auto' });
  });
});
