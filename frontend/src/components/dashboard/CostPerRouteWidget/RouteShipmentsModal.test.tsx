import { render, screen, fireEvent } from '@testing-library/react';
import RouteShipmentsModal from './RouteShipmentsModal';

describe('RouteShipmentsModal', () => {
  const shipments = [
    { id: 's1', trackingNumber: 'TRK-001', status: 'In Transit' },
    { id: 's2', trackingNumber: 'TRK-002', status: 'Delivered' },
  ];

  it('lists shipments for the route', () => {
    render(
      <RouteShipmentsModal
        isOpen
        routeName="Route A"
        shipments={shipments}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('TRK-001')).toBeInTheDocument();
    expect(screen.getByText('TRK-002')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('calls onClose when the modal is closed', () => {
    const onClose = jest.fn();
    render(
      <RouteShipmentsModal
        isOpen
        routeName="Route A"
        shipments={shipments}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
