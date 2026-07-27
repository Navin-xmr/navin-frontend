import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct aria attributes', () => {
    render(<ProgressBar value={40} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps value below 0 to 0', () => {
    render(<ProgressBar value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps value above 100 to 100', () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows label and percentage when label is provided', () => {
    render(<ProgressBar value={75} label="Upload progress" />);
    expect(screen.getByText('Upload progress')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('does not show percentage label when label is omitted', () => {
    render(<ProgressBar value={50} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('applies correct fill width via inline style', () => {
    const { container } = render(<ProgressBar value={60} />);
    const fill = container.querySelector('[style*="width: 60%"]');
    expect(fill).not.toBeNull();
  });
});
