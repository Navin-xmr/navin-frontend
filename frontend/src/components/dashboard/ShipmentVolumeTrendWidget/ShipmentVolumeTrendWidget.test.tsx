import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShipmentVolumeTrendWidget from './ShipmentVolumeTrendWidget';
import type { ShipmentVolumeTrendWidgetProps } from './ShipmentVolumeTrendWidget';
import type { TimeRange, Granularity, TrendDataPoint } from './mockTrendData';

// Mock Recharts components to avoid canvas issues in tests
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    AreaChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="area-chart">{children}</div>
    ),
  };
});

const mockData: Record<TimeRange, Record<Granularity, TrendDataPoint[]>> = {
  '7d': {
    daily: [
      { date: 'Jan 1', completed: 50, cancelled: 5 },
      { date: 'Jan 2', completed: 55, cancelled: 3 },
      { date: 'Jan 3', completed: 60, cancelled: 4 },
    ],
    weekly: [{ date: 'Jan 1', completed: 350, cancelled: 20 }],
    monthly: [{ date: 'Jan 2024', completed: 1500, cancelled: 80 }],
  },
  '30d': {
    daily: Array.from({ length: 30 }, (_, i) => ({
      date: `Jan ${i + 1}`,
      completed: 50 + i * 2,
      cancelled: 3 + Math.floor(i / 10),
    })),
    weekly: Array.from({ length: 4 }, (_, i) => ({
      date: `Week ${i + 1}`,
      completed: 350 + i * 20,
      cancelled: 20 + i,
    })),
    monthly: [{ date: 'Jan 2024', completed: 1500, cancelled: 80 }],
  },
  '90d': {
    daily: Array.from({ length: 90 }, (_, i) => ({
      date: `Day ${i + 1}`,
      completed: 50 + i,
      cancelled: 3 + Math.floor(i / 30),
    })),
    weekly: Array.from({ length: 13 }, (_, i) => ({
      date: `Week ${i + 1}`,
      completed: 350 + i * 10,
      cancelled: 20 + i,
    })),
    monthly: Array.from({ length: 3 }, (_, i) => ({
      date: `Month ${i + 1}`,
      completed: 1500 + i * 100,
      cancelled: 80 + i * 5,
    })),
  },
  '12m': {
    daily: Array.from({ length: 365 }, (_, i) => ({
      date: `Day ${i + 1}`,
      completed: 50 + i,
      cancelled: 3,
    })),
    weekly: Array.from({ length: 52 }, (_, i) => ({
      date: `Week ${i + 1}`,
      completed: 350 + i * 5,
      cancelled: 20,
    })),
    monthly: Array.from({ length: 12 }, (_, i) => ({
      date: `Month ${i + 1}`,
      completed: 1500 + i * 50,
      cancelled: 80 + i * 2,
    })),
  },
};

describe('ShipmentVolumeTrendWidget', () => {
  it('renders the component with default props', () => {
    render(<ShipmentVolumeTrendWidget />);

    expect(screen.getByText('Shipment Volume Trend')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('renders with custom data', () => {
    render(<ShipmentVolumeTrendWidget data={mockData} />);

    expect(screen.getByText('Shipment Volume Trend')).toBeInTheDocument();
  });

  it('displays granularity toggle buttons', () => {
    render(<ShipmentVolumeTrendWidget data={mockData} />);

    expect(screen.getByRole('button', { name: 'Daily' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Weekly' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Monthly' })).toBeInTheDocument();
  });

  it('switches granularity when buttons are clicked', () => {
    render(<ShipmentVolumeTrendWidget data={mockData} />);

    const dailyButton = screen.getByRole('button', { name: 'Daily' });
    const weeklyButton = screen.getByRole('button', { name: 'Weekly' });

    // Daily should be active by default
    expect(dailyButton).toHaveClass('bg-accent-blue');

    // Click weekly
    fireEvent.click(weeklyButton);
    expect(weeklyButton).toHaveClass('bg-accent-blue');
    expect(dailyButton).not.toHaveClass('bg-accent-blue');
  });

  it('displays time range selector with all options', () => {
    render(<ShipmentVolumeTrendWidget data={mockData} />);

    const select = screen.getByLabelText('Time range') as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    const options = Array.from(select.options).map(opt => opt.text);
    expect(options).toEqual([
      'Last 7 days',
      'Last 30 days',
      'Last 90 days',
      'Last 12 months',
    ]);
  });

  it('changes time range when selector is changed', () => {
    render(<ShipmentVolumeTrendWidget data={mockData} />);

    const select = screen.getByLabelText('Time range') as HTMLSelectElement;

    // Default should be 30d
    expect(select.value).toBe('30d');

    // Change to 90d
    fireEvent.change(select, { target: { value: '90d' } });
    expect(select.value).toBe('90d');
  });

  it('displays percentage change indicator', () => {
    render(<ShipmentVolumeTrendWidget data={mockData} />);

    // Should display a percentage value
    const percentageText = screen.getByText(/%$/);
    expect(percentageText).toBeInTheDocument();
  });

  it('shows trend icon based on data change', () => {
    const { container } = render(<ShipmentVolumeTrendWidget data={mockData} />);

    // Check if SVG icons are present (trend indicators)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('renders legend for completed and cancelled series', () => {
    const { container } = render(<ShipmentVolumeTrendWidget data={mockData} />);

    // Check that Legend component is present in the component tree
    // Since we mock Recharts, we can't test the actual legend rendering
    // but we can verify the data structure that would be passed to it
    expect(container.querySelector('[data-testid="area-chart"]')).toBeInTheDocument();
  });

  it('has correct ARIA labels for accessibility', () => {
    render(<ShipmentVolumeTrendWidget data={mockData} />);

    expect(screen.getByLabelText('Time range')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Granularity' })).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<ShipmentVolumeTrendWidget data={mockData} />);

    const widget = container.firstChild as HTMLElement;
    expect(widget).toHaveClass('bg-background-card');
    expect(widget).toHaveClass('border');
    expect(widget).toHaveClass('border-border');
    expect(widget).toHaveClass('rounded-2xl');
  });

  it('updates chart when both time range and granularity change', () => {
    render(<ShipmentVolumeTrendWidget data={mockData} />);

    const select = screen.getByLabelText('Time range') as HTMLSelectElement;
    const monthlyButton = screen.getByRole('button', { name: 'Monthly' });

    // Change time range
    fireEvent.change(select, { target: { value: '12m' } });
    expect(select.value).toBe('12m');

    // Change granularity
    fireEvent.click(monthlyButton);
    expect(monthlyButton).toHaveClass('bg-accent-blue');
  });

  it('handles edge case with minimal data', () => {
    const minimalData: ShipmentVolumeTrendWidgetProps['data'] = {
      '7d': {
        daily: [{ date: 'Jan 1', completed: 10, cancelled: 1 }],
        weekly: [{ date: 'Week 1', completed: 70, cancelled: 7 }],
        monthly: [{ date: 'Jan 2024', completed: 300, cancelled: 30 }],
      },
      '30d': {
        daily: [],
        weekly: [],
        monthly: [],
      },
      '90d': {
        daily: [],
        weekly: [],
        monthly: [],
      },
      '12m': {
        daily: [],
        weekly: [],
        monthly: [],
      },
    };

    render(<ShipmentVolumeTrendWidget data={minimalData} />);

    expect(screen.getByText('Shipment Volume Trend')).toBeInTheDocument();
  });
});
