import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  CardSkeleton,
  TableSkeleton,
  TableRowSkeleton,
  ShipmentsTableSkeleton,
  ProfileSkeleton,
  ShipmentCardSkeleton,
  DashboardWidgetSkeleton,
} from './SkeletonComponents';

describe('SkeletonComponents', () => {
  describe('CardSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<CardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a single card by default', () => {
      const { container } = render(<CardSkeleton />);
      const cards = container.querySelectorAll('[data-testid="card-skeleton"]');
      expect(cards.length).toBe(1);
    });

    it('renders the number of cards specified by count', () => {
      const { container } = render(<CardSkeleton count={3} />);
      const cards = container.querySelectorAll('[data-testid="card-skeleton"]');
      expect(cards.length).toBe(3);
    });

    it('forwards the variant prop to child Skeleton elements', () => {
      const { container } = render(<CardSkeleton variant="text" />);
      const skeletons = container.querySelectorAll('[data-variant="text"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('TableSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<TableSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the expected number of header cells based on columns', () => {
      const { container } = render(<TableSkeleton rows={3} columns={4} />);
      const headerCells = container.querySelectorAll(
        '[data-testid="table-skeleton-header-cell"]'
      );
      expect(headerCells.length).toBe(4);
    });

    it('renders the expected number of body cells based on rows and columns', () => {
      const { container } = render(<TableSkeleton rows={3} columns={4} />);
      const bodyCells = container.querySelectorAll(
        '[data-testid="table-skeleton-body-cell"]'
      );
      expect(bodyCells.length).toBe(12);
    });

    it('forwards the variant prop to child Skeleton elements', () => {
      const { container } = render(<TableSkeleton variant="text" />);
      const skeletons = container.querySelectorAll('[data-variant="text"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('TableRowSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRowSkeleton />
          </tbody>
        </table>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the expected number of rows based on count', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRowSkeleton count={3} columns={2} />
          </tbody>
        </table>
      );
      const rows = container.querySelectorAll('tr');
      expect(rows.length).toBe(3);
    });

    it('renders the expected number of cells based on columns', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRowSkeleton count={2} columns={5} />
          </tbody>
        </table>
      );
      const cells = container.querySelectorAll('td');
      expect(cells.length).toBe(10);
    });

    it('forwards the variant prop to child Skeleton elements', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRowSkeleton variant="text" />
          </tbody>
        </table>
      );
      const skeletons = container.querySelectorAll('[data-variant="text"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('ShipmentsTableSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<ShipmentsTableSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a table with the correct accessibility attributes', () => {
      render(<ShipmentsTableSkeleton />);
      const table = screen.getByRole('table', { name: 'Loading shipments' });
      expect(table).toBeInTheDocument();
      expect(table).toHaveAttribute('aria-busy', 'true');
    });

    it('renders the expected number of body rows', () => {
      const { container } = render(<ShipmentsTableSkeleton rows={4} />);
      const bodyRows = container.querySelectorAll('tbody tr');
      expect(bodyRows.length).toBe(4);
    });

    it('forwards the variant prop to child Skeleton elements', () => {
      const { container } = render(<ShipmentsTableSkeleton variant="text" />);
      const skeletons = container.querySelectorAll('[data-variant="text"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('ProfileSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<ProfileSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a single row by default', () => {
      const { container } = render(<ProfileSkeleton />);
      const rows = container.querySelectorAll('[data-testid="profile-skeleton-row"]');
      expect(rows.length).toBe(1);
    });

    it('renders the number of rows specified by count', () => {
      const { container } = render(<ProfileSkeleton count={2} />);
      const rows = container.querySelectorAll('[data-testid="profile-skeleton-row"]');
      expect(rows.length).toBe(2);
    });

    it('forwards the variant prop to child Skeleton elements', () => {
      const { container } = render(<ProfileSkeleton variant="text" />);
      const skeletons = container.querySelectorAll('[data-variant="text"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('ShipmentCardSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<ShipmentCardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a single card by default', () => {
      const { container } = render(<ShipmentCardSkeleton />);
      const cards = container.querySelectorAll('[data-testid="shipment-card-skeleton"]');
      expect(cards.length).toBe(1);
    });

    it('renders the number of cards specified by count', () => {
      const { container } = render(<ShipmentCardSkeleton count={2} />);
      const cards = container.querySelectorAll('[data-testid="shipment-card-skeleton"]');
      expect(cards.length).toBe(2);
    });

    it('forwards the variant prop to child Skeleton elements', () => {
      const { container } = render(<ShipmentCardSkeleton variant="text" />);
      const skeletons = container.querySelectorAll('[data-variant="text"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('DashboardWidgetSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<DashboardWidgetSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a single widget by default', () => {
      const { container } = render(<DashboardWidgetSkeleton />);
      const widgets = container.querySelectorAll(
        '[data-testid="dashboard-widget-skeleton"]'
      );
      expect(widgets.length).toBe(1);
    });

    it('renders the number of widgets specified by count', () => {
      const { container } = render(<DashboardWidgetSkeleton count={2} />);
      const widgets = container.querySelectorAll(
        '[data-testid="dashboard-widget-skeleton"]'
      );
      expect(widgets.length).toBe(2);
    });

    it('forwards the variant prop to child Skeleton elements', () => {
      const { container } = render(<DashboardWidgetSkeleton variant="text" />);
      const skeletons = container.querySelectorAll('[data-variant="text"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});