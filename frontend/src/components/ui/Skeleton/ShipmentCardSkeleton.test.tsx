import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ShipmentCardSkeleton from './ShipmentCardSkeleton';

describe('ShipmentCardSkeleton', () => {
  it('renders a single card by default', () => {
    const { container } = render(<ShipmentCardSkeleton />);
    const cards = container.querySelectorAll('[data-testid="shipment-card-skeleton"]');
    expect(cards).toHaveLength(1);
  });

  it('renders the specified number of cards when count prop is provided', () => {
    const { container } = render(<ShipmentCardSkeleton count={3} />);
    const cards = container.querySelectorAll('[data-testid="shipment-card-skeleton"]');
    expect(cards).toHaveLength(3);
  });

  it('applies the expected wrapper classes', () => {
    const { container } = render(<ShipmentCardSkeleton />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('animate-pulse');
    expect(wrapper).toHaveClass('rounded-lg');
    expect(wrapper).toHaveClass('bg-white');
    expect(wrapper).toHaveClass('shadow');
  });
});