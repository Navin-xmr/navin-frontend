import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Shipment, ShipmentStatus } from '@services/api/endpoints/shipments';

const { mockGetAll } = vi.hoisted(() => ({ mockGetAll: vi.fn() }));
vi.mock('@services/api/endpoints/shipments', () => ({ shipmentApi: { getAll: mockGetAll } }));

import ShipmentStatCards from './ShipmentStatCards';

const page = (count: number, hasMore = false) => ({
  data: Array.from({ length: count }, (_, i) => ({ id: `s-${i}` })) as unknown as Shipment[],
  meta: { nextCursor: null, hasMore },
});

const respondWith = (byStatus: Partial<Record<ShipmentStatus, ReturnType<typeof page>>>) =>
  mockGetAll.mockImplementation(({ status }: { status: ShipmentStatus }) =>
    Promise.resolve(byStatus[status] ?? page(0)),
  );

const cardFor = (label: string) => screen.getByText(label).parentElement as HTMLElement;

describe('ShipmentStatCards', () => {
  beforeEach(() => {
    mockGetAll.mockReset();
  });

  it('shows a loading state until the counts arrive', async () => {
    respondWith({});
    const { container } = render(<ShipmentStatCards />);

    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Active')).not.toBeInTheDocument();

    expect(await screen.findByText('Active')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'false');
  });

  it('shows the real count for each status', async () => {
    respondWith({ IN_TRANSIT: page(3), DELIVERED: page(7), CREATED: page(2), CANCELLED: page(1) });
    render(<ShipmentStatCards />);

    await screen.findByText('Active');
    expect(within(cardFor('Active')).getByText('3')).toBeInTheDocument();
    expect(within(cardFor('Delivered')).getByText('7')).toBeInTheDocument();
    expect(within(cardFor('Pending')).getByText('2')).toBeInTheDocument();
    expect(within(cardFor('Cancelled')).getByText('1')).toBeInTheDocument();
  });

  it('asks the API for each status separately', async () => {
    respondWith({});
    render(<ShipmentStatCards />);
    await screen.findByText('Active');

    const statuses = mockGetAll.mock.calls.map(([params]) => params.status);
    expect(statuses).toEqual(['IN_TRANSIT', 'DELIVERED', 'CREATED', 'CANCELLED']);
  });

  it('marks a count as a lower bound when more shipments exist', async () => {
    respondWith({ DELIVERED: page(100, true) });
    render(<ShipmentStatCards />);

    await screen.findByText('Delivered');
    expect(within(cardFor('Delivered')).getByText('100+')).toBeInTheDocument();
  });

  it('shows zero, not an invented figure, when there are no shipments', async () => {
    respondWith({});
    render(<ShipmentStatCards />);

    await screen.findByText('Active');
    expect(within(cardFor('Active')).getByText('0')).toBeInTheDocument();
    for (const invented of ['128', '1,420', '12', '45']) {
      expect(screen.queryByText(invented)).not.toBeInTheDocument();
    }
  });

  it('shows an error with a retry when the counts cannot be loaded', async () => {
    const user = userEvent.setup();
    mockGetAll.mockRejectedValueOnce(new Error('Network down'));
    render(<ShipmentStatCards />);

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load shipment counts");
    expect(screen.queryByText('Active')).not.toBeInTheDocument();

    respondWith({ IN_TRANSIT: page(4) });
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(within(cardFor('Active')).getByText('4')).toBeInTheDocument();
  });

  it('reloads when the refresh key changes', async () => {
    respondWith({ IN_TRANSIT: page(1) });
    const { rerender } = render(<ShipmentStatCards refreshKey={0} />);
    await screen.findByText('Active');
    expect(mockGetAll).toHaveBeenCalledTimes(4);

    respondWith({ IN_TRANSIT: page(5) });
    rerender(<ShipmentStatCards refreshKey={1} />);

    await waitFor(() => expect(within(cardFor('Active')).getByText('5')).toBeInTheDocument());
    expect(mockGetAll).toHaveBeenCalledTimes(8);
  });
});
