import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Shipments from './Shipments';
import { shipmentApi } from '../../api/shipmentApi';

vi.mock('../../api/shipmentApi', () => ({
  shipmentApi: {
    getAll: vi.fn(),
  },
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));


vi.mock('./hooks/useVirtualShipments', () => ({
  useVirtualShipments: ({ shipments }: { shipments: unknown[] }) => ({
    parentRef: { current: null },
    virtualizer: {
      getVirtualItems: () =>
        shipments.map((_, index) => ({
          key: index,
          index,
          start: index * 52,
        })),
      getTotalSize: () => shipments.length * 52,
      measureElement: () => {},
    },
    handleScroll: vi.fn(),
    scrollToIndex: vi.fn(),
  }),
}));
describe('Shipments', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(shipmentApi.getAll).mockResolvedValue({
      data: [
        {
          id: 'SHIP-001',
          origin: 'Lagos',
          destination: 'Abuja',
          status: 'CREATED',
          createdAt: '2026-08-10T10:00:00Z',
          priority: 'STANDARD',
        },
      ],
      meta: {
        page: 1,
        limit: 50,
        total: 1,
      },
    });
  });

  it('shows no results when filters match no shipments and clears the filters', async () => {
    render(
      <MemoryRouter>
        <Shipments />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('SHIP-001')).toBeInTheDocument();
    });

    await import('@testing-library/user-event').then(async ({ default: userEvent }) => {
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /^filters$/i }));

      const originInput = await screen.findByLabelText('Origin City');

      await user.type(originInput, 'Kano');

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
        expect(
          screen.getByText('No shipments match the selected filters.'),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: 'Clear Filters' }),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole('button', { name: 'Clear Filters' }),
      );

      await waitFor(() => {
        expect(screen.getByText('SHIP-001')).toBeInTheDocument();
      });
    });
  });
});


