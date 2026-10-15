import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TableRowSkeleton, { ShipmentsTableSkeleton } from './TableRowSkeleton';

describe('TableRowSkeleton', () => {
  it('renders a default single row', () => {
    const { container } = render(<TableRowSkeleton />);
    const rows = container.querySelectorAll('tr');
    expect(rows).toHaveLength(1);
  });

  it('renders the number of rows specified by the count prop', () => {
    const { container } = render(<TableRowSkeleton count={5} />);
    const rows = container.querySelectorAll('tr');
    expect(rows).toHaveLength(5);
  });

  it('renders the number of cells specified by the columns prop', () => {
    const { container } = render(<TableRowSkeleton columns={3} />);
    const cells = container.querySelectorAll('td');
    expect(cells).toHaveLength(3);
  });

  it('renders padding cells beyond the preset widths', () => {
    const { container } = render(<TableRowSkeleton columns={8} />);
    const cells = container.querySelectorAll('td');
    expect(cells).toHaveLength(8);
  });
});

describe('ShipmentsTableSkeleton', () => {
  it('renders with the expected aria-label and aria-busy attributes', () => {
    render(<ShipmentsTableSkeleton />);
    const region = screen.getByLabelText('Loading shipments');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-busy', 'true');
  });

  it('renders header cells', () => {
    const { container } = render(<ShipmentsTableSkeleton />);
    const headerCells = container.querySelectorAll('th');
    expect(headerCells.length).toBeGreaterThan(0);
  });
});