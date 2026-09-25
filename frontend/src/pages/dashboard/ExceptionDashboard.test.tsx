import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExceptionDashboard from './ExceptionDashboard';
import { exceptionApi } from '@services/api/endpoints/exceptions';
import type { ShipmentException } from '@services/api/endpoints/exceptions';

vi.mock('@services/api/endpoints/exceptions', () => ({
  exceptionApi: {
    getAll: vi.fn(),
    resolve: vi.fn(),
  },
}));

const mockedGetAll = vi.mocked(exceptionApi.getAll);

const mockExceptions: ShipmentException[] = [
  {
    id: 'EX-1021',
    shipmentId: 'SHP-1042',
    type: 'DELAYED',
    status: 'OPEN',
    ageHours: 38,
    owner: 'Amina',
    route: 'Lagos → Abuja',
    openedAt: new Date().toISOString(),
    resolutionHours: 12,
    severity: 'HIGH',
  },
];

describe('ExceptionDashboard', () => {
  beforeEach(() => {
    mockedGetAll.mockReset();
    mockedGetAll.mockResolvedValue(mockExceptions);
  });

  it('renders KPI cards, filters, and inline resolution controls', async () => {
    const user = userEvent.setup();
    render(<ExceptionDashboard />);

    expect(screen.getByText(/exception rate dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/total exceptions this week/i)).toBeInTheDocument();
    expect(screen.getByText(/exception trend/i)).toBeInTheDocument();
    expect(screen.getByText(/open exceptions/i)).toBeInTheDocument();

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'DELAYED');

    const resolveButtons = await screen.findAllByRole('button', { name: /resolve/i });
    await user.click(resolveButtons[0]);

    expect(await screen.findByPlaceholderText(/add an update/i)).toBeInTheDocument();
  });
});
