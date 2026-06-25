import React from 'react';
import { Thermometer, Droplets, MapPin, Battery } from 'lucide-react';
import type { TelemetryRecord } from './hooks/useTelemetry';

interface Props {
  reading: TelemetryRecord;
}

interface CardDef {
  label: string;
  value: string;
  icon: React.ReactNode;
  alert: boolean;
  alertLevel: 'error' | 'warning' | 'ok';
}

function buildCards(r: TelemetryRecord): CardDef[] {
  const now = Date.now();
  const gpsAge = now - new Date(r.timestamp).getTime();
  const gpsStale = gpsAge > 30 * 60 * 1000;

  return [
    {
      label: 'Temperature',
      value: `${r.temperature}°C`,
      icon: <Thermometer size={20} />,
      alert: r.temperature < 2 || r.temperature > 30,
      alertLevel: r.temperature < 2 || r.temperature > 30 ? 'error' : 'ok',
    },
    {
      label: 'Humidity',
      value: `${r.humidity}%`,
      icon: <Droplets size={20} />,
      alert: r.humidity < 30 || r.humidity > 80,
      alertLevel: r.humidity < 30 || r.humidity > 80 ? 'error' : 'ok',
    },
    {
      label: 'Last GPS Fix',
      value: `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`,
      icon: <MapPin size={20} />,
      alert: gpsStale,
      alertLevel: gpsStale ? 'warning' : 'ok',
    },
    {
      label: 'Battery',
      value: `${r.batteryLevel}%`,
      icon: <Battery size={20} />,
      alert: r.batteryLevel < 15,
      alertLevel: r.batteryLevel < 15 ? 'error' : 'ok',
    },
  ];
}

const alertColors = {
  error: 'border-red-400 dark:border-red-600 text-red-600 dark:text-red-400',
  warning: 'border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-400',
  ok: 'border-border text-text-primary',
};

const IoTSummaryCards: React.FC<Props> = ({ reading }) => {
  const cards = buildCards(reading);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 flex flex-col gap-2 bg-background-card ${alertColors[card.alertLevel]}`}
        >
          <div className={`flex items-center gap-2 text-sm font-medium opacity-70`}>
            {card.icon}
            {card.label}
          </div>
          <div className={`text-xl font-semibold font-mono ${card.alert ? '' : 'text-text-primary'}`}>
            {card.value}
          </div>
          {card.alert && (
            <div className="text-xs font-medium">
              {card.alertLevel === 'error' ? '⚠ Out of range' : '⚠ Stale'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default IoTSummaryCards;
