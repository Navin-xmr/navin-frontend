import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CardSkeleton from './CardSkeleton';

describe('CardSkeleton', () => {
  it('renders a single card by default', () => {
    const { container } = render(<CardSkeleton />);
    const cards = container.querySelectorAll('[data-testid="card-skeleton"]');
    expect(cards).toHaveLength(1);
  });

  it('renders multiple cards when count prop is provided', () => {
    const { container } = render(<CardSkeleton count={3} />);
    const cards = container.querySelectorAll('[data-testid="card-skeleton"]');
    expect(cards).toHaveLength(3);
  });

  it('propagates the variant prop to each card', () => {
    const { container } = render(<CardSkeleton count={2} variant="compact" />);
    const cards = container.querySelectorAll('[data-testid="card-skeleton"]');
    expect(cards).toHaveLength(2);
    cards.forEach((card) => {
      expect(card).toHaveAttribute('data-variant', 'compact');
    });
  });

  it('applies the expected wrapper classes', () => {
    const { container } = render(<CardSkeleton />);
    const wrapper = container.firstElementChild;
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass('card-skeleton');
  });
});