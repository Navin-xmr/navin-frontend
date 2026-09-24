import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AnomalyAlertPanel from './AnomalyAlertPanel';
import type { Anomaly } from '@services/api/endpoints/anomalies';

const getAllMock = vi.fn();
const acknowledgeMock = vi.fn();

vi.mock('@services/api/endpoints/anomalies', async () => {
  const actual = await vi.importActual<typeof import('@services/api/endpoints/anomalies')>(
    '@services/api/endpoints/anomalies'
  );
  return {
    ...actual,
    anomalyApi: {
      getAll: (...args: unknown[]) => getAllMock(...args),
      acknowledge: (...args: unknown[]) => acknowledgeMock(...args),
    },
  };
});

function makeAnomaly(overrides: Partial<Anomaly> = {}): Anomaly {
  return {
    _id: 'an-1',
    shipmentId: 'ship-1',
    type: 'TEMPERATURE_EXCEEDED',
    severity: 'HIGH',
    message: 'Temperature exceeded threshold',
    timestamp: '2026-08-27T10:00:00.000Z',
    resolved: false,
    createdAt: '2026-08-27T10:00:00.000Z',
    updatedAt: '2026-08-27T10:00:00.000Z',
    ...overrides,
  };
}

function renderPanel() {
  return render(
    <MemoryRouter>
      <AnomalyAlertPanel />
    </MemoryRouter>
  );
}

describe('AnomalyAlertPanel', () => {
  beforeEach(() => {
    getAllMock.mockReset();
    acknowledgeMock.mockReset();
  });

  it('shows the all-clear empty state when there are no open anomalies', async () => {
    getAllMock.mockResolvedValue({ data: [], meta: {} });
    renderPanel();

    expect(await screen.findByText('All clear!')).toBeInTheDocument();
    expect(screen.getByText('No open anomalies')).toBeInTheDocument();
  });

  it('renders anomalies sorted by severity', async () => {
    getAllMock.mockResolvedValue({
      data: [
        makeAnomaly({ _id: 'low-1', severity: 'LOW', type: 'BATTERY_LOW' }),
        makeAnomaly({ _id: 'high-1', severity: 'HIGH', type: 'TEMPERATURE_EXCEEDED' }),
      ],
      meta: {},
    });
    renderPanel();

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('HIGH');
    expect(items[1]).toHaveTextContent('LOW');
    expect(screen.getByText('2 open anomalies')).toBeInTheDocument();
  });

  it('shows an error state and retries on button click', async () => {
    getAllMock.mockRejectedValueOnce(new Error('network error'));
    renderPanel();

    expect(await screen.findByText('Failed to load anomalies. Please try again.')).toBeInTheDocument();

    getAllMock.mockResolvedValueOnce({ data: [], meta: {} });
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('All clear!')).toBeInTheDocument();
  });

  it('acknowledges an anomaly and removes it from the list', async () => {
    getAllMock.mockResolvedValue({ data: [makeAnomaly()], meta: {} });
    acknowledgeMock.mockResolvedValue({});
    renderPanel();

    await screen.findByText('Temperature Exceeded');

    await userEvent.click(screen.getByRole('button', { name: /Acknowledge anomaly an-1/i }));

    await waitFor(() => expect(acknowledgeMock).toHaveBeenCalledWith('an-1'));
    await waitFor(() => expect(screen.queryByText('Temperature Exceeded')).not.toBeInTheDocument());
  });
});
