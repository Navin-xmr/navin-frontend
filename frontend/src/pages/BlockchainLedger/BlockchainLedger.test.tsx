
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BlockchainLedger from './BlockchainLedger';
import type { PaginatedLedgerBlocks } from '@services/api/endpoints/ledger';

// ─── Mock ledgerApi ───────────────────────────────────────────────────────────

vi.mock('@services/api/endpoints/ledger', () => ({
  ledgerApi: {
    getBlocks: vi.fn(),
  },
}));

import { ledgerApi } from '@services/api/endpoints/ledger';

const mockGetBlocks = ledgerApi.getBlocks as ReturnType<typeof vi.fn>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeBlock = (n: number) => ({
  blockNumber: 50_000_000 + n,
  timestamp: `2024-03-15T${String(10 + n).padStart(2, '0')}:00:00.000Z`,
  shipmentId: `ship-${n}`,
  shipmentReference: `NAV-2024-00${n}`,
  milestoneEvent: 'DELIVERED' as const,
  transactionHash: `${'a'.repeat(60)}000${n}`,
  ledger: 50_000_000 + n,
  verified: true,
});

const singlePageResponse: PaginatedLedgerBlocks = {
  data: [makeBlock(1), makeBlock(2), makeBlock(3)],
  nextCursor: null,
  hasMore: false,
  total: 3,
};

const multiPageFirstResponse: PaginatedLedgerBlocks = {
  data: [makeBlock(1), makeBlock(2)],
  nextCursor: 'cursor-page-2',
  hasMore: true,
  total: 4,
};

const multiPageSecondResponse: PaginatedLedgerBlocks = {
  data: [makeBlock(3), makeBlock(4)],
  nextCursor: null,
  hasMore: false,
  total: 4,
};

const emptyResponse: PaginatedLedgerBlocks = {
  data: [],
  nextCursor: null,
  hasMore: false,
  total: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renderPage = () => render(<BlockchainLedger />);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BlockchainLedger page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Loading skeleton ──────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows loading skeletons while fetching', () => {
      // Never resolves during this test
      mockGetBlocks.mockReturnValue(new Promise(() => {}));
      renderPage();

      // Table headers should be visible
      expect(screen.getByText('Block #')).toBeInTheDocument();
      expect(screen.getByText('Timestamp')).toBeInTheDocument();
      expect(screen.getByText('Milestone')).toBeInTheDocument();

      // No block data rendered yet
      expect(screen.queryByText('NAV-2024-001')).not.toBeInTheDocument();
    });
  });

  // ── Data rendering ────────────────────────────────────────────────────────

  describe('data rendering', () => {
    it('renders table with block data after loading', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('NAV-2024-001')).toBeInTheDocument();
        expect(screen.getByText('NAV-2024-002')).toBeInTheDocument();
        expect(screen.getByText('NAV-2024-003')).toBeInTheDocument();
      });
    });

    it('renders block numbers with # prefix', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('#50,000,001')).toBeInTheDocument();
      });
    });

    it('renders milestone badge for each block', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        const delivered = screen.getAllByText('Delivered');
        // 3 blocks all DELIVERED
        expect(delivered.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('renders "Verified" status for verified blocks', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        const verified = screen.getAllByText('Verified');
        expect(verified.length).toBe(3);
      });
    });

    it('renders "Pending" status for unverified blocks', async () => {
      const unverified: PaginatedLedgerBlocks = {
        data: [{ ...makeBlock(1), verified: false }],
        nextCursor: null,
        hasMore: false,
        total: 1,
      };
      mockGetBlocks.mockResolvedValue(unverified);
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });

    it('renders tx hash links pointing to Stellar Expert', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        const txLinks = links.filter((l) =>
          l.getAttribute('href')?.includes('stellar.expert/explorer/public/tx'),
        );
        expect(txLinks.length).toBeGreaterThan(0);
      });
    });

    it('tx hash links open in new tab', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        links.forEach((link) => {
          expect(link).toHaveAttribute('target', '_blank');
          expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });
      });
    });

    it('renders total block count in stats bar', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  describe('empty state', () => {
    it('renders empty state when no blocks are returned', async () => {
      mockGetBlocks.mockResolvedValue(emptyResponse);
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('No blocks found')).toBeInTheDocument();
      });
    });

    it('does not show pagination when no blocks', async () => {
      mockGetBlocks.mockResolvedValue(emptyResponse);
      renderPage();

      await waitFor(() => {
        expect(screen.queryByLabelText('Load next page')).not.toBeInTheDocument();
      });
    });
  });

  // ── Error state ───────────────────────────────────────────────────────────

  describe('error state', () => {
    it('renders error banner when API call fails', async () => {
      mockGetBlocks.mockRejectedValue(new Error('Network Error'));
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Error loading ledger')).toBeInTheDocument();
      });
    });
  });

  // ── Pagination ────────────────────────────────────────────────────────────

  describe('cursor-based pagination', () => {
    it('shows Next button when hasMore is true', async () => {
      mockGetBlocks.mockResolvedValue(multiPageFirstResponse);
      renderPage();

      await waitFor(() => {
        expect(screen.getByLabelText('Load next page')).toBeInTheDocument();
      });
    });

    it('Next button is disabled when hasMore is false', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        // Pagination bar only shown when hasMore || pageIndex > 0
        expect(screen.queryByLabelText('Load next page')).not.toBeInTheDocument();
      });
    });

    it('Previous button is disabled on first page', async () => {
      mockGetBlocks.mockResolvedValue(multiPageFirstResponse);
      renderPage();

      await waitFor(() => {
        const prevBtn = screen.getByLabelText('Previous page');
        expect(prevBtn).toBeDisabled();
      });
    });

    it('clicking Next loads page 2 data', async () => {
      mockGetBlocks
        .mockResolvedValueOnce(multiPageFirstResponse)
        .mockResolvedValueOnce(multiPageSecondResponse);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText('NAV-2024-001')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Load next page'));

      await waitFor(() => {
        expect(screen.getByText('NAV-2024-003')).toBeInTheDocument();
        expect(screen.getByText('NAV-2024-004')).toBeInTheDocument();
      });

      expect(mockGetBlocks).toHaveBeenCalledTimes(2);
      expect(mockGetBlocks).toHaveBeenNthCalledWith(2, {
        limit: 15,
        cursor: 'cursor-page-2',
      });
    });

    it('clicking Previous goes back to page 1 data', async () => {
      mockGetBlocks
        .mockResolvedValueOnce(multiPageFirstResponse) // page 1
        .mockResolvedValueOnce(multiPageSecondResponse) // page 2
        .mockResolvedValueOnce(multiPageFirstResponse); // back to page 1

      renderPage();

      await waitFor(() => screen.getByText('NAV-2024-001'));

      fireEvent.click(screen.getByLabelText('Load next page'));
      await waitFor(() => screen.getByText('NAV-2024-003'));

      const prevBtn = screen.getByLabelText('Previous page');
      expect(prevBtn).not.toBeDisabled();
      fireEvent.click(prevBtn);

      await waitFor(() => {
        expect(screen.getByText('NAV-2024-001')).toBeInTheDocument();
      });
    });
  });

  // ── Filtering ─────────────────────────────────────────────────────────────

  describe('filter functionality', () => {
    it('renders "All Events" filter button', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('All Events')).toBeInTheDocument();
      });
    });

    it('clicking a milestone filter calls API with that event', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => screen.getByText('Delivered'));

      // Click the filter button (in the filter bar – not the table badge)
      const filterBtn = screen.getByRole('button', { name: /^Delivered$/ });
      fireEvent.click(filterBtn);

      await waitFor(() => {
        // Last call should include milestoneEvent: 'DELIVERED'
        const lastCall = mockGetBlocks.mock.calls.at(-1)?.[0] as { milestoneEvent?: string } | undefined;
        expect(lastCall?.milestoneEvent).toBe('DELIVERED');
      });
    });

    it('selecting a filter resets to page 1', async () => {
      mockGetBlocks
        .mockResolvedValueOnce(multiPageFirstResponse)
        .mockResolvedValueOnce(multiPageSecondResponse)
        .mockResolvedValue(singlePageResponse);

      renderPage();
      await waitFor(() => screen.getByText('NAV-2024-001'));

      // Go to page 2
      fireEvent.click(screen.getByLabelText('Load next page'));
      await waitFor(() => screen.getByText('NAV-2024-003'));

      // Apply filter → should reset pagination (no cursor on next call)
      const filterBtn = screen.getByRole('button', { name: /^Delivered$/ });
      fireEvent.click(filterBtn);

      await waitFor(() => {
        // After filter reset, getBlocks is called without cursor
        const lastCall = mockGetBlocks.mock.calls.at(-1)?.[0] as { cursor?: string; milestoneEvent?: string } | undefined;
        expect(lastCall?.cursor).toBeUndefined();
        expect(lastCall?.milestoneEvent).toBe('DELIVERED');
      });
    });
  });

  // ── Refresh ───────────────────────────────────────────────────────────────

  describe('refresh button', () => {
    it('renders refresh button', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        expect(screen.getByLabelText('Refresh ledger data')).toBeInTheDocument();
      });
    });

    it('clicking refresh re-fetches data', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => screen.getByText('NAV-2024-001'));

      const refreshBtn = screen.getByLabelText('Refresh ledger data');
      fireEvent.click(refreshBtn);

      await waitFor(() => {
        expect(mockGetBlocks).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('table has accessible aria-label', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole('table', { name: /blockchain ledger events table/i }),
        ).toBeInTheDocument();
      });
    });

    it('h1 heading is present', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /blockchain ledger/i })).toBeInTheDocument();
      });
    });

    it('page renders as main landmark', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });
  });
});
