import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShipmentMap from './ShipmentMap';

describe('ShipmentMap placeholder', () => {
  test('renders map view with origin/destination and view button', () => {
    render(
      <ShipmentMap
        origin="Origin Place"
        destination="Destination Place"
        originCoords={{ lat: 1, lng: 2 }}
        destinationCoords={{ lat: 3, lng: 4 }}
      />
    );

    expect(screen.getByRole('heading', { name: /map view/i })).toBeInTheDocument();
    expect(screen.getByText('ORIGIN:')).toBeInTheDocument();
    expect(screen.getByText('DESTINATION:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View full map/i })).toBeInTheDocument();
  });
});
