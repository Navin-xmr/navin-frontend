import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ChartLoading from './ChartLoading';

describe('ChartLoading', () => {
  it('renders a loading status with the default label', () => {
    render(<ChartLoading />);

    const status = screen.getByRole('status', { name: 'Loading chart…' });
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass('animate-pulse');
    expect(status).toHaveStyle({ height: '300px' });
  });

  it('renders the default number of skeleton bars', () => {
    const { container } = render(<ChartLoading />);

    expect(container.querySelectorAll('rect')).toHaveLength(5);
  });

  it('applies custom rows, height and label', () => {
    const { container } = render(<ChartLoading rows={8} height={400} label="Loading revenue" />);

    const status = screen.getByRole('status', { name: 'Loading revenue' });
    expect(status).toHaveStyle({ height: '400px' });
    expect(container.querySelectorAll('rect')).toHaveLength(8);
  });
});
