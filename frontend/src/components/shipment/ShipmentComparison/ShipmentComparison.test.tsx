import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ShipmentComparison, { type ShipmentForComparison } from './ShipmentComparison';
import type { MilestoneDetail } from '../MilestoneTimeline/MilestoneTimeline';

function makeMilestone(id: string, status: MilestoneDetail['status']): MilestoneDetail {
  return {
    id,
    name: id,
    timestamp: '2026-08-01T00:00:00.000Z',
    location: 'Warehouse',
    blockchainAddress: 'GABCDEF',
    status,
  };
}

const shipments: ShipmentForComparison[] = [
  {
    id: '1',
    shipmentId: 'SHP-001',
    origin: 'Chicago, IL',
    destination: 'Houston, TX',
    status: 'IN_TRANSIT',
    milestones: [makeMilestone('m1', 'completed'), makeMilestone('m2', 'upcoming')],
    expectedDelivery: '2026-09-01',
    createdAt: '2026-08-01',
  },
  {
    id: '2',
    shipmentId: 'SHP-002',
    origin: 'Denver, CO',
    destination: 'Miami, FL',
    status: 'DELIVERED',
    milestones: [makeMilestone('m3', 'completed')],
    expectedDelivery: '2026-08-15',
    createdAt: '2026-07-20',
  },
  {
    id: '3',
    shipmentId: 'SHP-003',
    origin: 'Austin, TX',
    destination: 'Seattle, WA',
    status: 'PENDING',
    milestones: [],
    expectedDelivery: '2026-09-10',
    createdAt: '2026-08-05',
  },
];

describe('ShipmentComparison', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ShipmentComparison shipments={shipments} onClose={vi.fn()} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the comparison table pre-selected with the first two shipments', () => {
    render(<ShipmentComparison shipments={shipments} onClose={vi.fn()} isOpen />);

    expect(screen.getByText('Compare Shipments')).toBeInTheDocument();
    expect(screen.getByText('Comparing 2 shipments')).toBeInTheDocument();
    expect(screen.getAllByText('SHP-001').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SHP-002').length).toBeGreaterThan(0);
  });

  it('toggles a shipment into the comparison when selected', async () => {
    render(<ShipmentComparison shipments={shipments} onClose={vi.fn()} isOpen />);

    const card = screen.getByLabelText('Select SHP-003').closest('button') as HTMLButtonElement;
    await userEvent.click(card);

    expect(screen.getByText('Comparing 3 shipments')).toBeInTheDocument();
  });

  it('shows the empty state and hides the table when all shipments are deselected', async () => {
    render(<ShipmentComparison shipments={shipments} onClose={vi.fn()} isOpen />);

    const cardOne = screen.getByLabelText('Select SHP-001').closest('button') as HTMLButtonElement;
    const cardTwo = screen.getByLabelText('Select SHP-002').closest('button') as HTMLButtonElement;
    await userEvent.click(cardOne);
    await userEvent.click(cardTwo);

    expect(screen.getByText('Select shipments to compare')).toBeInTheDocument();
    expect(screen.getByText('Select at least 2 shipments to compare')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<ShipmentComparison shipments={shipments} onClose={onClose} isOpen />);

    await userEvent.click(screen.getByLabelText('Close comparison'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
