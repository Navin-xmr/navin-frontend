import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SensorDataCards, { type SensorData } from './SensorDataCards';

const sensorData: SensorData = {
  temperature: { value: 4.5, unit: '°C', lastUpdated: '2026-08-27 10:00' },
  humidity: { value: 62, unit: '%', lastUpdated: '2026-08-27 10:00' },
  gps: { latitude: 41.8781, longitude: -87.6298, lastUpdated: '2026-08-27 10:00' },
  shockTilt: { eventCount: 2, lastUpdated: '2026-08-27 10:00' },
};

describe('SensorDataCards', () => {
  it('renders the empty state when there is no sensor data', () => {
    render(<SensorDataCards sensorData={null} />);
    expect(screen.getByText('No Sensor Data Available')).toBeInTheDocument();
  });

  it('renders all sensor cards when full data is provided', () => {
    render(<SensorDataCards sensorData={sensorData} />);

    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();

    expect(screen.getByText('Humidity')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();

    expect(screen.getByText('GPS Location')).toBeInTheDocument();
    expect(screen.getByText('41.8781° N')).toBeInTheDocument();
    expect(screen.getByText('87.6298° W')).toBeInTheDocument();

    expect(screen.getByText('Shock/Tilt Events')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows per-metric placeholders for missing readings', () => {
    render(<SensorDataCards sensorData={{ temperature: sensorData.temperature }} />);

    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('No humidity data')).toBeInTheDocument();
    expect(screen.getByText('No GPS data')).toBeInTheDocument();
    expect(screen.getByText('No shock/tilt data')).toBeInTheDocument();
  });
});
