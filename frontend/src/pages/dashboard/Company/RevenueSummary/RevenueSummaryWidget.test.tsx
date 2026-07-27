import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RevenueSummaryWidget from './RevenueSummaryWidget';
import { settlementsApi } from '../../../../services/api/endpoints/settlements';

vi.mock('../../../../services/api/endpoints/settlements', () => ({
  settlementsApi: {
    getSummary: vi.fn(),
  },
}));

const mockedGetSummary = vi.mocked(settlementsApi.getSummary);

describe('RevenueSummaryWidget', () => {
  beforeEach(() => {
    mockedGetSummary.mockReset();
    mockedGetSummary.mockResolvedValue({
      totalReleased: 123456.78,
      totalInEscrow: 9876.54,
      totalPending: 2345.67,
      sparkline: [100, 120, 95, 140, 130, 155, 170],
    });
  });

  it('renders the summary data and supports period switching', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><RevenueSummaryWidget /></MemoryRouter>);

    expect(await screen.findByText('Total USDC Released This Month')).toBeInTheDocument();
    expect(screen.getByText('USDC 123,456.78')).toBeInTheDocument();
    expect(screen.getByText('USDC 9,876.54')).toBeInTheDocument();
    expect(screen.getByText('USDC 2,345.67')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'This Week' }));
    expect(mockedGetSummary).toHaveBeenCalledWith('week');
  });
});
