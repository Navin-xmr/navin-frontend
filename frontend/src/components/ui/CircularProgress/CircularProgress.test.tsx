import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CircularProgress from './CircularProgress';

describe('CircularProgress', () => {
  it('renders with correct aria attributes', () => {
    render(<CircularProgress value={65} />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveAttribute('aria-valuenow', '65');
    expect(el).toHaveAttribute('aria-valuemin', '0');
    expect(el).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps value below 0 to 0', () => {
    render(<CircularProgress value={-5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps value above 100 to 100', () => {
    render(<CircularProgress value={120} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows percentage in SVG center text', () => {
    render(<CircularProgress value={42} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('shows outer label when provided', () => {
    render(<CircularProgress value={80} label="Escrow released" />);
    expect(screen.getByText('Escrow released')).toBeInTheDocument();
  });

  it('renders SVG with two circles (track + arc)', () => {
    const { container } = render(<CircularProgress value={50} />);
    expect(container.querySelectorAll('circle')).toHaveLength(2);
  });

  it('applies stroke-dashoffset proportional to value', () => {
    const size = 80;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const expectedOffset = circumference - (50 / 100) * circumference;

    const { container } = render(<CircularProgress value={50} size={size} strokeWidth={strokeWidth} />);
    const arc = container.querySelectorAll('circle')[1];
    expect(Number(arc?.getAttribute('stroke-dashoffset'))).toBeCloseTo(expectedOffset, 1);
  });
});
