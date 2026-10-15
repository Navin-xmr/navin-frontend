import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TableSkeleton from './TableSkeleton';

describe('TableSkeleton', () => {
  it('renders with default rows and columns', () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.querySelectorAll('tr');
    // 1 header row + 5 default body rows
    expect(rows).toHaveLength(6);
    const headerCells = rows[0].querySelectorAll('th, td');
    expect(headerCells).toHaveLength(4);
  });

  it('renders custom number of rows', () => {
    const { container } = render(<TableSkeleton rows={3} />);
    const rows = container.querySelectorAll('tr');
    // 1 header row + 3 body rows
    expect(rows).toHaveLength(4);
  });

  it('renders custom number of columns', () => {
    const { container } = render(<TableSkeleton columns={6} />);
    const rows = container.querySelectorAll('tr');
    const headerCells = rows[0].querySelectorAll('th, td');
    expect(headerCells).toHaveLength(6);
  });

  it('renders header and body row counts correctly', () => {
    const { container } = render(<TableSkeleton rows={2} columns={3} />);
    const rows = container.querySelectorAll('tr');
    expect(rows).toHaveLength(3);
    const headerCells = rows[0].querySelectorAll('th, td');
    expect(headerCells).toHaveLength(3);
    const bodyRows = Array.from(rows).slice(1);
    expect(bodyRows).toHaveLength(2);
    bodyRows.forEach((row) => {
      expect(row.querySelectorAll('th, td')).toHaveLength(3);
    });
  });

  it('propagates the variant prop', () => {
    render(<TableSkeleton variant="dark" />);
    const skeleton = screen.getByTestId('table-skeleton');
    expect(skeleton).toHaveAttribute('data-variant', 'dark');
  });
});