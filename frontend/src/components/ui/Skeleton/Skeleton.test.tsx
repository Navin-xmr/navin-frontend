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
  });
});