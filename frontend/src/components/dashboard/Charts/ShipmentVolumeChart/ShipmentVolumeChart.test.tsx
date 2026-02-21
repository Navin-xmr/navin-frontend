import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ShipmentVolumeChart from './ShipmentVolumeChart';
import { generateMockData } from './mockVolumeData';

// Recharts uses ResizeObserver internally
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

describe('ShipmentVolumeChart', () => {
  it('renders without errors', () => {
    const { container } = render(<ShipmentVolumeChart />);
    expect(container.querySelector('.volume-chart-section')).not.toBeNull();
  });

  it('displays the section title', () => {
    render(<ShipmentVolumeChart />);
    expect(screen.getByText('Shipment Volume')).toBeInTheDocument();
  });

  it('renders three range toggle buttons', () => {
    render(<ShipmentVolumeChart />);
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('30D')).toBeInTheDocument();
    expect(screen.getByText('90D')).toBeInTheDocument();
  });

  it('defaults to 30D active', () => {
    render(<ShipmentVolumeChart />);
    expect(screen.getByText('30D')).toHaveClass('active');
  });

  it('switches active range when toggle buttons are clicked', () => {
    render(<ShipmentVolumeChart />);

    const btn7 = screen.getByText('7D');
    fireEvent.click(btn7);
    expect(btn7).toHaveClass('active');
    expect(screen.getByText('30D')).not.toHaveClass('active');

    const btn90 = screen.getByText('90D');
    fireEvent.click(btn90);
    expect(btn90).toHaveClass('active');
    expect(btn7).not.toHaveClass('active');
  });

  it('accepts custom data via props', () => {
    const customData = generateMockData(10);
    const { container } = render(<ShipmentVolumeChart data={customData} />);
    expect(container.querySelector('.volume-chart-section')).not.toBeNull();
  });
});
