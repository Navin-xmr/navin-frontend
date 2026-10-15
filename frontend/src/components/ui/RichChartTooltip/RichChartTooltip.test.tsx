import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RichChartTooltip } from './RichChartTooltip';

describe('RichChartTooltip', () => {
  it('renders nothing when active is false', () => {
    const { container } = render(
      <RichChartTooltip
        active={false}
        items={[{ label: 'Revenue', value: 100 }]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when items is undefined', () => {
    const { container } = render(<RichChartTooltip active={true} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(
      <RichChartTooltip active={true} items={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title and data rows with labels and formatted values', () => {
    render(
      <RichChartTooltip
        active={true}
        title="Monthly Overview"
        items={[
          { label: 'Revenue', value: 1234 },
          { label: 'Orders', value: 56 },
        ]}
      />,
    );

    expect(screen.getByText('Monthly Overview')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('56')).toBeInTheDocument();
  });

  it('renders values with unit variants', () => {
    render(
      <RichChartTooltip
        active={true}
        items={[
          { label: 'Revenue', value: 1234, unit: '$' },
          { label: 'Growth', value: 12, unit: '%' },
          { label: 'Weight', value: 30, unit: 'kg' },
        ]}
      />,
    );

    expect(screen.getByText('$1,234')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
    expect(screen.getByText('30 kg')).toBeInTheDocument();
  });

  it('renders secondaryValue as "/ value"', () => {
    render(
      <RichChartTooltip
        active={true}
        items={[
          { label: 'Revenue', value: 1234, secondaryValue: 2000 },
        ]}
      />,
    );

    expect(screen.getByText('/ 2,000')).toBeInTheDocument();
  });

  it('renders trend indicators with trendLabel fallback', () => {
    render(
      <RichChartTooltip
        active={true}
        items={[
          { label: 'Revenue', value: 1234, trend: 'up' },
          { label: 'Orders', value: 56, trend: 'down' },
          { label: 'Returns', value: 3, trend: 'flat' },
        ]}
      />,
    );

    expect(screen.getByText('▲')).toBeInTheDocument();
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders custom trendLabel when provided', () => {
    render(
      <RichChartTooltip
        active={true}
        items={[
          { label: 'Revenue', value: 1234, trend: 'up', trendLabel: '+12%' },
        ]}
      />,
    );

    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renders total label and value', () => {
    render(
      <RichChartTooltip
        active={true}
        items={[{ label: 'Revenue', value: 1234 }]}
        total={{ label: 'Total', value: 1234 }}
      />,
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders action buttons and invokes onClick without bubbling', () => {
    const onClick = vi.fn();
    const onParentClick = vi.fn();

    render(
      <div onClick={onParentClick}>
        <RichChartTooltip
          active={true}
          items={[{ label: 'Revenue', value: 1234 }]}
          actions={[{ label: 'View details', onClick }]}
        />
      </div>,
    );

    const button = screen.getByRole('button', { name: 'View details' });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('renders color indicator dot when item.color is provided', () => {
    const { container } = render(
      <RichChartTooltip
        active={true}
        items={[{ label: 'Revenue', value: 1234, color: '#ff0000' }]}
      />,
    );

    const dot = container.querySelector('[data-testid="color-indicator"]');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('does not render color indicator dot when item.color is absent', () => {
    const { container } = render(
      <RichChartTooltip
        active={true}
        items={[{ label: 'Revenue', value: 1234 }]}
      />,
    );

    expect(
      container.querySelector('[data-testid="color-indicator"]'),
    ).not.toBeInTheDocument();
  });
});