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
    expect(await screen.findByRole('link', { name: 'SHP-001' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'SHP-001' })).toHaveAttribute(
      'href',
      '/dashboard/shipments/SHP-001',
    );
    expect(screen.getAllByText('RELEASED')).toHaveLength(1);
    expect(screen.getByText(/1,234/)).toBeInTheDocument();
    expect(api.getSettlements).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 10,
        status: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
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

    expect(await screen.findByRole('link', { name: 'SHP-001' })).toBeInTheDocument();
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
      expect(api.getSettlements).toHaveBeenLastCalledWith(
        {
          page: 1,
          limit: 10,
          status: 'RELEASED',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    );

    await user.click(screen.getByRole('button', { name: 'Sort by date newest first' }));
    await waitFor(() =>
      expect(api.getSettlements).toHaveBeenLastCalledWith(
        {
          page: 1,
          limit: 10,
          status: 'RELEASED',
          sortBy: 'createdAt',
          sortOrder: 'asc',
        },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    );
    expect(screen.getByRole('button', { name: 'Sort by date oldest first' })).toBeInTheDocument();
  });

  it('requests the next page and opens a detail modal with chain verification', async () => {
    api.getSettlements.mockResolvedValue(response(payments, 25));
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('SHP-001');

    expect(screen.getByText('Page 1 of 3 · 25 total')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() =>
      expect(api.getSettlements).toHaveBeenLastCalledWith(
        {
          page: 2,
          limit: 10,
          status: undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    );

    await user.click(screen.getAllByRole('button', { name: 'View' })[0]);
    expect(await screen.findByRole('dialog', { name: 'Payment Details' })).toBeInTheDocument();
    expect(await screen.findAllByText('SHP-001')).toBeDefined();
    expect(api.getSettlementById).toHaveBeenCalledWith('settlement-1');
    const txLinks = screen.getAllByRole('link', { name: /abc123/i });
    expect(txLinks.length).toBeGreaterThanOrEqual(1);
    expect(txLinks[0]).toHaveAttribute(
      'href',
      'https://stellar.expert/explorer/testnet/tx/abc1234567890defgh',
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows the latest request result when two requests resolve out of order', async () => {
    // page-1 request is slow; page-2 request finishes first.
    let resolvePage1!: (value: PaginatedSettlements) => void;
    const page1Promise = new Promise<PaginatedSettlements>((resolve) => {
      resolvePage1 = resolve;
    });

    const page2Data: Settlement[] = [
      {
        _id: 'payment-p2',
        createdAt: '2026-08-17T12:00:00.000Z',
        shipmentId: 'SHP-PAGE2',
        amount: 555,
        token: 'XLM',
        status: 'PENDING',
      },
    ];

    // First call (page 1) hangs; second call (page 2) resolves immediately.
    api.getSettlements
      .mockReturnValueOnce(page1Promise)
      .mockResolvedValueOnce(response(page2Data, page2Data.length));

    const user = userEvent.setup();
    renderPage();

    // Wait for page-1 in-flight request to start (it hangs).
    await waitFor(() => expect(api.getSettlements).toHaveBeenCalledTimes(1));

    // While page-1 is still in flight, change the status filter.
    // This cancels page-1 and fires a new request (page2Data).
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by payment status' }),
      'PENDING',
    );

    // The new (filter-change) response arrives and shows SHP-PAGE2.
    await screen.findByText('SHP-PAGE2');

    // Now resolve the stale page-1 response — it must NOT overwrite the table.
    resolvePage1(response(payments));
    await new Promise((r) => setTimeout(r, 50));

    expect(screen.getByText('SHP-PAGE2')).toBeInTheDocument();
    // SHP-001 should NOT appear (stale page-1 response was aborted).
    expect(screen.queryByRole('link', { name: 'SHP-001' })).not.toBeInTheDocument();
  });
});
