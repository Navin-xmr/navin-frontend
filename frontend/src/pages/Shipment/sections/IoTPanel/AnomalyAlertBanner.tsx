import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { TelemetryRecord } from './hooks/useTelemetry';

interface Props {
  reading: TelemetryRecord;
}

const ANOMALY_MESSAGES: Record<NonNullable<TelemetryRecord['anomalyType']>, (r: TelemetryRecord) => string> = {
  TEMPERATURE_BREACH: (r) =>
    `Temperature Breach Detected — Reading of ${r.temperature}°C at ${new Date(r.timestamp).toUTCString()} exceeds the safe limit.`,
  HUMIDITY_BREACH: (r) =>
    `Humidity Breach Detected — Reading of ${r.humidity}% at ${new Date(r.timestamp).toUTCString()} is outside safe range.`,
  SHOCK_EVENT: (r) =>
    `Shock Event Detected — ${r.shockMagnitude}G impact recorded at ${new Date(r.timestamp).toUTCString()}.`,
  GPS_LOST: () => 'GPS Signal Lost — Location data is unavailable.',
};

const AnomalyAlertBanner: React.FC<Props> = ({ reading }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !reading.isAnomaly) return null;

  const message = reading.anomalyType
    ? ANOMALY_MESSAGES[reading.anomalyType](reading)
    : 'Anomaly detected in the latest sensor reading.';

  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
    >
      <AlertTriangle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">
        <span className="font-semibold">⚠️ {reading.anomalyType?.replace('_', ' ') ?? 'Anomaly'}</span>
        {' — '}
        {message}
      </p>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss anomaly alert"
        className="shrink-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default AnomalyAlertBanner;
