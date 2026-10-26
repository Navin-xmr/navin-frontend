import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ShipmentVolumeChart from './ShipmentVolumeChart';
import { buildVolumeFixture } from '@/test/fixtures/shipmentVolumeFixture';

// Recharts uses ResizeObserver internally
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

const VOLUME = buildVolumeFixture(90);

describe('ShipmentVolumeChart', () => {
  it('renders without errors', () => {
    const { container } = render(<ShipmentVolumeChart data={VOLUME} />);
    // Component renders a top-level div with padding
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays the section title', () => {
    render(<ShipmentVolumeChart data={VOLUME} />);
    expect(screen.getByText('Shipment Volume')).toBeInTheDocument();
  });

  it('renders three range toggle buttons', () => {
    render(<ShipmentVolumeChart data={VOLUME} />);
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('30D')).toBeInTheDocument();
    expect(screen.getByText('90D')).toBeInTheDocument();
  });

  it('defaults to 30D active (highlighted with accent color)', () => {
    render(<ShipmentVolumeChart data={VOLUME} />);
    const btn30 = screen.getByText('30D');
    // Active button has bg-accent-blue class applied
    expect(btn30.className).toContain('bg-accent-blue');
  });

  it('switches active range when toggle buttons are clicked', () => {
    render(<ShipmentVolumeChart data={VOLUME} />);

    const btn7 = screen.getByText('7D');
    const btn30 = screen.getByText('30D');
    const btn90 = screen.getByText('90D');

    fireEvent.click(btn7);
    expect(btn7.className).toContain('bg-accent-blue');
    expect(btn30.className).not.toContain('bg-accent-blue');

    fireEvent.click(btn90);
    expect(btn90.className).toContain('bg-accent-blue');
    expect(btn7.className).not.toContain('bg-accent-blue');
  });

  it('accepts custom data via props', () => {
    const customData = buildVolumeFixture(10);
    const { container } = render(<ShipmentVolumeChart data={customData} />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByText('No shipment volume data available')).not.toBeInTheDocument();
  });

  it('shows an empty state, not an invented chart, when no data is given', () => {
    render(<ShipmentVolumeChart />);
    expect(screen.getByText('No shipment volume data available')).toBeInTheDocument();
    expect(screen.getByText('Shipment Volume')).toBeInTheDocument();
  });

  it('shows an empty state for an empty series', () => {
    render(<ShipmentVolumeChart data={[]} />);
    expect(screen.getByText('No shipment volume data available')).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    render(<ShipmentVolumeChart loading />);
    expect(screen.getByRole('status', { name: 'Loading shipment volume…' })).toBeInTheDocument();
  });

  it('shows the error message and retries', () => {
    const onRetry = vi.fn();
    render(<ShipmentVolumeChart error="Could not load shipment volume" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load shipment volume');
    expect(screen.queryByText('No shipment volume data available')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
