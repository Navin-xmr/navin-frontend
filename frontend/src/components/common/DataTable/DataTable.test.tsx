import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DataTable from './DataTable';
import type { ColumnDef, DataTableProps, PaginationConfig } from './types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  status: string;
  amount: number;
}

const COLUMNS: ColumnDef<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount', sortable: true },
];

const ROWS: Row[] = [
  { id: '1', name: 'Alpha', status: 'active', amount: 300 },
  { id: '2', name: 'Beta', status: 'inactive', amount: 100 },
  { id: '3', name: 'Gamma', status: 'active', amount: 200 },
];

function renderTable(props: Partial<DataTableProps<Row>> = {}) {
  return render(
    <DataTable<Row>
      columns={COLUMNS}
      data={ROWS}
      {...props}
    />,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DataTable', () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  describe('basic render', () => {
    it('renders column headers', () => {
      renderTable();
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
    });

    it('renders all data rows', () => {
      renderTable();
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('Gamma')).toBeInTheDocument();
    });

    it('renders custom cell content via render function', () => {
      const columns: ColumnDef<Row>[] = [
        ...COLUMNS,
        {
          key: 'status',
          label: 'Status',
          render: (val) => <span data-testid="custom-cell">{String(val).toUpperCase()}</span>,
        },
      ];
      render(<DataTable<Row> columns={columns} data={ROWS} />);
      const cells = screen.getAllByTestId('custom-cell');
      expect(cells[0]).toHaveTextContent('ACTIVE');
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('renders a loading skeleton when loading=true', () => {
      const { container } = renderTable({ loading: true });
      // Skeleton rows use an animate-pulse div; check that they are present
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('still renders column headers while loading', () => {
      renderTable({ loading: true });
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('does not render data rows while loading', () => {
      renderTable({ loading: true });
      expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    });
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  describe('empty state', () => {
    it('renders the default empty message when data is empty', () => {
      render(<DataTable<Row> columns={COLUMNS} data={[]} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders a custom empty message', () => {
      render(
        <DataTable<Row>
          columns={COLUMNS}
          data={[]}
          emptyState={{ message: 'No shipments found' }}
        />,
      );
      expect(screen.getByText('No shipments found')).toBeInTheDocument();
    });

    it('renders the empty state CTA button when provided', async () => {
      const onCta = vi.fn();
      render(
        <DataTable<Row>
          columns={COLUMNS}
          data={[]}
          emptyState={{ message: 'Empty', cta: { label: 'Add item', onClick: onCta } }}
        />,
      );
      const btn = screen.getByRole('button', { name: /add item/i });
      expect(btn).toBeInTheDocument();
      await userEvent.click(btn);
      expect(onCta).toHaveBeenCalledTimes(1);
    });
  });

  // ── Sorting ────────────────────────────────────────────────────────────────

  describe('sorting', () => {
    it('sorts ascending on first click of a sortable column', async () => {
      const user = userEvent.setup();
      renderTable();

      await user.click(screen.getByText('Name'));

      const rows = screen.getAllByRole('row').slice(1); // skip header
      expect(rows[0]).toHaveTextContent('Alpha');
      expect(rows[1]).toHaveTextContent('Beta');
      expect(rows[2]).toHaveTextContent('Gamma');
    });

    it('sorts descending on second click of the same sortable column', async () => {
      const user = userEvent.setup();
      renderTable();

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader); // asc
      await user.click(nameHeader); // desc

      const rows = screen.getAllByRole('row').slice(1);
      expect(rows[0]).toHaveTextContent('Gamma');
      expect(rows[1]).toHaveTextContent('Beta');
      expect(rows[2]).toHaveTextContent('Alpha');
    });

    it('resets sort on third click of the same sortable column', async () => {
      const user = userEvent.setup();
      renderTable();

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader); // asc
      await user.click(nameHeader); // desc
      await user.click(nameHeader); // reset

      // Original order restored
      const rows = screen.getAllByRole('row').slice(1);
      expect(rows[0]).toHaveTextContent('Alpha');
    });

    it('sorts numeric column correctly (ascending)', async () => {
      const user = userEvent.setup();
      renderTable();

      await user.click(screen.getByText('Amount'));

      const rows = screen.getAllByRole('row').slice(1);
      expect(rows[0]).toHaveTextContent('100');
      expect(rows[1]).toHaveTextContent('200');
      expect(rows[2]).toHaveTextContent('300');
    });

    it('does not respond to click on non-sortable column', async () => {
      const user = userEvent.setup();
      renderTable();

      // "ID" column is not sortable — clicking it should not reorder rows
      const originalFirst = screen.getAllByRole('row')[1].textContent;
      await user.click(screen.getByText('ID'));
      expect(screen.getAllByRole('row')[1].textContent).toBe(originalFirst);
    });
  });

  // ── Row click ─────────────────────────────────────────────────────────────

  describe('row click', () => {
    it('calls onRowClick with the correct row when a row is clicked', async () => {
      const onRowClick = vi.fn();
      const user = userEvent.setup();
      renderTable({ onRowClick });

      await user.click(screen.getByText('Beta'));
      expect(onRowClick).toHaveBeenCalledWith(ROWS[1]);
    });

    it('does not render cursor-pointer class when onRowClick is absent', () => {
      const { container } = renderTable();
      const tbodyRows = container.querySelectorAll('tbody tr');
      tbodyRows.forEach((row) => {
        expect(row.className).not.toContain('cursor-pointer');
      });
    });
  });

  // ── Pagination ────────────────────────────────────────────────────────────

  describe('pagination', () => {
    const buildPagination = (overrides: Partial<PaginationConfig> = {}): PaginationConfig => ({
      currentPage: 1,
      totalPages: 3,
      onPageChange: vi.fn(),
      totalItems: 30,
      itemsPerPage: 10,
      ...overrides,
    });

    it('renders page buttons when pagination is provided', () => {
      renderTable({ pagination: buildPagination() });
      expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
    });

    it('marks the current page button as aria-current="page"', () => {
      renderTable({ pagination: buildPagination({ currentPage: 2 }) });
      expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('calls onPageChange when a page button is clicked', async () => {
      const onPageChange = vi.fn();
      const user = userEvent.setup();
      renderTable({ pagination: buildPagination({ onPageChange }) });

      await user.click(screen.getByRole('button', { name: 'Page 3' }));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('disables the previous button on page 1', () => {
      renderTable({ pagination: buildPagination({ currentPage: 1 }) });
      expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    });

    it('disables the next button on the last page', () => {
      renderTable({ pagination: buildPagination({ currentPage: 3, totalPages: 3 }) });
      expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
    });

    it('calls onPageChange with currentPage - 1 when previous is clicked', async () => {
      const onPageChange = vi.fn();
      const user = userEvent.setup();
      renderTable({
        pagination: buildPagination({ currentPage: 2, onPageChange }),
      });

      await user.click(screen.getByRole('button', { name: /previous page/i }));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('shows item range summary when totalItems and itemsPerPage are given', () => {
      renderTable({
        pagination: buildPagination({ currentPage: 2, totalItems: 30, itemsPerPage: 10 }),
      });
      expect(screen.getByText(/11–20 of 30/)).toBeInTheDocument();
    });

    it('does not render pagination when totalPages <= 1', () => {
      renderTable({
        pagination: buildPagination({ currentPage: 1, totalPages: 1 }),
      });
      expect(screen.queryByRole('button', { name: 'Page 1' })).not.toBeInTheDocument();
    });
  });

  // ── Density variants ──────────────────────────────────────────────────────

  describe('density variants', () => {
    it.each(['compact', 'comfortable', 'spacious'] as const)(
      'renders with density="%s" without error',
      (density) => {
        expect(() => renderTable({ density })).not.toThrow();
      },
    );
  });
});
