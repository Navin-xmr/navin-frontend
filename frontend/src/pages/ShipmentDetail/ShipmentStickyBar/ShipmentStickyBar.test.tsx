import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ShipmentStickyBar from './ShipmentStickyBar';

const { mockObserver } = vi.hoisted(() => ({ mockObserver: { observe: vi.fn(), disconnect: vi.fn() } }));
vi.stubGlobal('IntersectionObserver', vi.fn(function (callback: IntersectionObserverCallback) {
  (mockObserver as { callback?: IntersectionObserverCallback }).callback = callback;
  return mockObserver;
}));

describe('ShipmentStickyBar', () => {
  it('renders shipment summary and becomes visible when the sentinel leaves view', async () => {
    const sentinel = document.createElement('div');
    const sentinelRef = { current: sentinel };
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    render(<ShipmentStickyBar sentinelRef={sentinelRef} shipmentId="SHP-1" status="IN_TRANSIT" originAddress="Origin" destinationAddress="Destination" expectedDeliveryDate="2026-03-01" priority="URGENT" />);
    expect(screen.getByRole('complementary', { name: 'Shipment summary bar' })).toHaveAttribute('aria-hidden', 'true');
    act(() => { (mockObserver as { callback?: IntersectionObserverCallback }).callback?.([{ isIntersecting: false } as IntersectionObserverEntry] as IntersectionObserverEntry[], {} as IntersectionObserver); });
    expect(screen.getByRole('complementary', { name: 'Shipment summary bar' })).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText('SHP-1')).toBeInTheDocument();
    expect(screen.getByText('URGENT')).toBeInTheDocument();
  });

  it('scrolls the sentinel into view from the Top action', () => {
    const sentinel = document.createElement('div');
    sentinel.scrollIntoView = vi.fn();
    const sentinelRef = { current: sentinel };
    render(<ShipmentStickyBar sentinelRef={sentinelRef} shipmentId="SHP-1" status="DELIVERED" />);
    fireEvent.click(screen.getByRole('button', { name: 'Scroll back to top of page' }));
    expect(sentinel.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });
});
