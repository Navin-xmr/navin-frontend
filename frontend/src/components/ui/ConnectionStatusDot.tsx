import React from 'react';
import type { ConnectionStatus } from '@services/realtime/realtimeService';

interface ConnectionStatusDotProps {
  status: ConnectionStatus;
}

const labels: Record<ConnectionStatus, string> = {
  connected: 'Real-time connected',
  reconnecting: 'Reconnecting…',
  disconnected: 'Disconnected — polling fallback active',
};

const colors: Record<ConnectionStatus, string> = {
  connected: 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]',
  reconnecting: 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]',
  disconnected: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]',
};

const ConnectionStatusDot: React.FC<ConnectionStatusDotProps> = ({ status }) => (
  <span
    className={`inline-block w-2 h-2 rounded-full ${colors[status]}`}
    title={labels[status]}
    aria-label={labels[status]}
  />
);

export default ConnectionStatusDot;
