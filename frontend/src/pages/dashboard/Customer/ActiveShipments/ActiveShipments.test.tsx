import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ActiveShipments from './ActiveShipments';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('ActiveShipments', () => {
  it('renders at least four shipment cards with required fields', () => {
    render(<ActiveShipments />);

    const cards = screen.getAllByTestId('active-shipment-card');
    expect(cards.length).toBeGreaterThanOrEqual(4);

    expect(screen.getByText('SHP-2001')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('Singapore')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles')).toBeInTheDocument();
    expect(screen.getByText('Feb 28, 2026')).toBeInTheDocument();
  });

  it('navigates to shipment detail page when track is clicked', () => {
    render(<ActiveShipments />);

    const firstTrackButton = screen.getAllByRole('button', { name: 'Track' })[0];
    fireEvent.click(firstTrackButton);

    expect(navigateMock).toHaveBeenCalledWith('/dashboard/shipments/SHP-2001');
  });
});
