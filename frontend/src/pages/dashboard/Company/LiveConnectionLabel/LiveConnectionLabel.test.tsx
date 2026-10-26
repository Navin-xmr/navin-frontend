import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConnectionStatus } from '@services/realtime/realtimeService';

const service = vi.hoisted(() => ({
  status: 'disconnected' as ConnectionStatus,
  handlers: new Set<(status: ConnectionStatus) => void>(),
  onStatusChange(handler: (status: ConnectionStatus) => void) {
    service.handlers.add(handler);
    return () => {
      service.handlers.delete(handler);
    };
  },
}));

vi.mock('@services/realtime/realtimeService', () => ({ realtimeService: service }));

import LiveConnectionLabel from './LiveConnectionLabel';

describe('LiveConnectionLabel', () => {
  beforeEach(() => {
    service.status = 'disconnected';
    service.handlers.clear();
  });

  it.each([
    ['connected', 'Connected'],
    ['reconnecting', 'Reconnecting'],
    ['disconnected', 'Disconnected'],
    ['offline', 'Offline'],
  ] as const)('shows %s when the realtime service is %s', (status, label) => {
    service.status = status;

    render(<LiveConnectionLabel />);

    expect(screen.getByRole('status')).toHaveTextContent(`Live: ${label}`);
  });

  it('does not claim to be connected before a connection exists', () => {
    render(<LiveConnectionLabel />);

    expect(screen.queryByText('Connected')).not.toBeInTheDocument();
  });

  it('updates when the connection state changes', () => {
    render(<LiveConnectionLabel />);
    expect(screen.getByRole('status')).toHaveTextContent('Live: Disconnected');

    act(() => service.handlers.forEach((handler) => handler('connected')));

    expect(screen.getByRole('status')).toHaveTextContent('Live: Connected');
  });
});
