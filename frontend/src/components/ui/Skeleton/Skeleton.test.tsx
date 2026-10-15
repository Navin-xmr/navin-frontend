import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders a div with aria-hidden="true"', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies the default animate-pulse and rounded-md classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('rounded-md');
  });

  it('honors width and height style props', () => {
    render(<Skeleton data-testid="skeleton" width="120px" height="40px" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveStyle({ width: '120px', height: '40px' });
  });

  it('applies each rounded value', () => {
    const cases: Array<{ rounded: 'none' | 'sm' | 'md' | 'lg' | 'full'; expected: string }> = [
      { rounded: 'none', expected: 'rounded-none' },
      { rounded: 'sm', expected: 'rounded-sm' },
      { rounded: 'md', expected: 'rounded-md' },
      { rounded: 'lg', expected: 'rounded-lg' },
      { rounded: 'full', expected: 'rounded-full' },
    ];

    cases.forEach(({ rounded, expected }) => {
      const { unmount } = render(<Skeleton data-testid="skeleton" rounded={rounded} />);
      const el = screen.getByTestId('skeleton');
      expect(el).toHaveClass(expected);
      unmount();
    });
  });

  it('applies the shimmer class and renders the inner shimmer overlay div', () => {
    render(<Skeleton data-testid="skeleton" variant="shimmer" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('shimmer');
    const overlay = el.querySelector('div');
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveClass('shimmer-overlay');
  });

  it('forwards className', () => {
    render(<Skeleton data-testid="skeleton" className="custom-class" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('custom-class');
  });
});