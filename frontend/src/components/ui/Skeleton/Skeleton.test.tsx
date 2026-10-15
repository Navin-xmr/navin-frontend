import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('bg-[#1e293b]');
    expect(el).toHaveClass('rounded-md');
  });

  it('merges custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('custom-class');
    expect(el).toHaveClass('animate-pulse');
  });

  it('applies width and height styles', () => {
    const { container } = render(<Skeleton width={100} height={50} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('100px');
    expect(el.style.height).toBe('50px');
  });

  it('applies string width and height styles', () => {
    const { container } = render(<Skeleton width="50%" height="2rem" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('50%');
    expect(el.style.height).toBe('2rem');
  });

  it('applies rounded variants', () => {
    const { container } = render(<Skeleton rounded="full" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('rounded-full');
    expect(el).not.toHaveClass('rounded-md');
  });

  it('renders shimmer child for shimmer variant', () => {
    const { container } = render(<Skeleton variant="shimmer" />);
    const el = container.firstChild as HTMLElement;
    expect(el).not.toHaveClass('animate-pulse');
    const shimmerChild = el.querySelector('.animate-shimmer');
    expect(shimmerChild).toBeInTheDocument();
  });

  it('has aria-hidden attribute', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
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