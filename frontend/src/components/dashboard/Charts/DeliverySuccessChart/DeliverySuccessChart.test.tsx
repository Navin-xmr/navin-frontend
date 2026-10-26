import { describe, it, expect, beforeAll, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DeliverySuccessChart from './DeliverySuccessChart';
import { DELIVERY_OUTCOMES_FIXTURE } from '@/test/fixtures/deliveryOutcomesFixture';

// Recharts uses ResizeObserver internally
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
});

describe('DeliverySuccessChart', () => {
  it('renders the chart title', () => {
    render(<DeliverySuccessChart data={DELIVERY_OUTCOMES_FIXTURE} />);
    expect(screen.getByText(/Delivery Success Rate/i)).toBeInTheDocument();
  });

  it('displays the success percentage', () => {
    render(<DeliverySuccessChart data={DELIVERY_OUTCOMES_FIXTURE} />);
    const successRate = screen.getByText(/\d+%/);
    expect(successRate).toBeInTheDocument();
  });

  it('renders all legend items', () => {
    render(<DeliverySuccessChart data={DELIVERY_OUTCOMES_FIXTURE} />);
    DELIVERY_OUTCOMES_FIXTURE.forEach(item => {
      expect(screen.getByText(item.status)).toBeInTheDocument();
      expect(screen.getByText(item.count.toString())).toBeInTheDocument();
    });
  });

  it('displays total count', () => {
    render(<DeliverySuccessChart data={DELIVERY_OUTCOMES_FIXTURE} />);
    const total = DELIVERY_OUTCOMES_FIXTURE.reduce((sum, item) => sum + item.count, 0);
    expect(screen.getByText(total.toString())).toBeInTheDocument();
  });

  it('accepts custom data prop', () => {
    const customData = [
      { status: 'Delivered', count: 100, color: '#10b981' },
      { status: 'Failed', count: 10, color: '#ef4444' },
    ];
    render(<DeliverySuccessChart data={customData} />);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows an empty state, not invented figures, when no data is given', () => {
    render(<DeliverySuccessChart />);
    expect(screen.getByText('No delivery data available')).toBeInTheDocument();
    expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
    expect(screen.queryByText('Total')).not.toBeInTheDocument();
  });

  it('shows the empty state when every outcome has a zero count', () => {
    render(<DeliverySuccessChart data={[{ status: 'Delivered', count: 0, color: '#10b981' }]} />);
    expect(screen.getByText('No delivery data available')).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    render(<DeliverySuccessChart loading />);
    expect(screen.getByRole('status', { name: 'Loading delivery success rates…' })).toBeInTheDocument();
  });

  it('shows the error message and retries', () => {
    const onRetry = vi.fn();
    render(<DeliverySuccessChart error="Could not load delivery outcomes" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load delivery outcomes');
    expect(screen.queryByText('No delivery data available')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
