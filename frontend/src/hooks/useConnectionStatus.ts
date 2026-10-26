import { useEffect, useState } from 'react';
import { realtimeService, type ConnectionStatus } from '@services/realtime/realtimeService';

/** The state of the realtime connection, kept current as it changes. */
export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(realtimeService.status);

  useEffect(() => realtimeService.onStatusChange(setStatus), []);

  return status;
}
