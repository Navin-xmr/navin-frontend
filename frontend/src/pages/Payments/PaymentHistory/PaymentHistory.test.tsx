import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PaymentHistory from './PaymentHistory';
import type {
  PaginatedSettlements,
  Settlement,
  SettlementDetail,
} from '@services/api/endpoints/settlements';

const api = vi.hoisted(() => ({
  getSettlements: vi.fn(),
  getSettlementById: vi.fn(),
}));

vi.mock('@services/api/endpoints/settlements', () => ({ settlementsApi: api }));

const payments: Settlement[] = [
  {
    _id: 'settlement-1',
    createdAt: '2026-08-20T12:00:00.000Z',
    shipmentId: 'SHP-001',
    amount: 1234,
    token: 'USDC',
    status: 'RELEASED',
    stellarTxHash: 'abc1234567890defgh',
  },
  {
    _id: 'settlement-2',
    createdAt: '2026-08-19T12:00:00.000Z',
    shipmentId: 'SHP-002',
    amount: 800,
    token: 'XLM',
    status: 'PENDING',
  },
];

const detail: SettlementDetail = {
  settlement: {
    ...payments[0],
    escrowRelease: { conditionDescription: 'Delivery verified' },
  },
  summary: { totalSettledAmount: 1234 },
};

function response(data: Settlement[] = payments, total = data.length): PaginatedSettlements {
  return { data, page: 1, limit: 10, total };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <PaymentHistory />
    </MemoryRouter>,
  );
}

describe('PaymentHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getSettlements.mockResolvedValue(response());
    api.getSettlementById.mockResolvedValue(detail);
  });

  it('loads payments and renders the status, amount, and shipment link', async () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Payment History' })).toBeInTheDocument();
    expect((await screen.findAllByText('SHP-001')).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('RELEASED')).toHaveLength(2);
    expect(screen.getAllByText('1,234')).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'SHP-001' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'SHP-001' })[0]).toHaveAttribute(
      'href',
      '/dashboard/shipments/SHP-001',
    );
    expect(api.getSettlements).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('shows a retryable error and reloads successfully after retry', async () => {
    api.getSettlements
      .mockRejectedValueOnce(new Error('settlements unavailable'))
      .mockResolvedValueOnce(response());
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Failed to load payment history')).toBeInTheDocument();
    expect(screen.getByText('settlements unavailable')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect((await screen.findAllByText('SHP-001')).length).toBeGreaterThanOrEqual(2);
    expect(api.getSettlements).toHaveBeenCalledTimes(2);
  });

  it('requests the selected status and toggles the date sort order', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('SHP-001');

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by payment status' }),
      'RELEASED',
    );
    await waitFor(() =>
      expect(api.getSettlements).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        status: 'RELEASED',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Sort by date newest first' }));
    await waitFor(() =>
      expect(api.getSettlements).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        status: 'RELEASED',
        sortBy: 'createdAt',
        sortOrder: 'asc',
      }),
    );
    expect(screen.getByRole('button', { name: 'Sort by date oldest first' })).toBeInTheDocument();
  });

  it('requests the next page and opens a detail modal with chain verification', async () => {
    api.getSettlements.mockResolvedValue(response(payments, 25));
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('SHP-001');

    expect(screen.getByText('Page 1 of 3 · 25 total')).toBeInTheDocument();
    const nextPageButton = screen
      .getAllByRole('button')
      .find((button) => button.querySelector('svg.lucide-chevron-right'));
    expect(nextPageButton).toBeDefined();
    await user.click(nextPageButton!);
    await waitFor(() =>
      expect(api.getSettlements).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        status: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    );

    await user.click(screen.getAllByText('1,234')[0]);
    expect(await screen.findByRole('dialog', { name: 'Payment Details' })).toBeInTheDocument();
    expect((await screen.findAllByText('SHP-001')).length).toBeGreaterThanOrEqual(2);
    expect(api.getSettlementById).toHaveBeenCalledWith('settlement-1');
    expect(screen.getAllByRole('link', { name: /abc123/i })).toHaveLength(3);
    expect(screen.getAllByRole('link', { name: /abc123/i })[0]).toHaveAttribute(
      'href',
      'https://stellar.expert/explorer/public/tx/abc1234567890defgh',
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
