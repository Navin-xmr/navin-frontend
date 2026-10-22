import { act, renderHook } from '@testing-library/react';
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

import { useConnectionStatus } from './useConnectionStatus';

describe('useConnectionStatus', () => {
  beforeEach(() => {
    service.status = 'disconnected';
    service.handlers.clear();
  });

  it('starts with the current status of the realtime service', () => {
    service.status = 'connected';

    const { result } = renderHook(() => useConnectionStatus());

    expect(result.current).toBe('connected');
  });

  it('follows status changes', () => {
    const { result } = renderHook(() => useConnectionStatus());
    expect(result.current).toBe('disconnected');

    act(() => service.handlers.forEach((handler) => handler('reconnecting')));
    expect(result.current).toBe('reconnecting');

    act(() => service.handlers.forEach((handler) => handler('connected')));
    expect(result.current).toBe('connected');
  });

  it('stops listening when the component unmounts', () => {
    const { unmount } = renderHook(() => useConnectionStatus());
    expect(service.handlers.size).toBe(1);

    unmount();

    expect(service.handlers.size).toBe(0);
  });
});
