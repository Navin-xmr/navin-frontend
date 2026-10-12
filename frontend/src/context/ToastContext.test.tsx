import React from 'react';
import { render, screen, act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './ToastContext';
import { LiveRegionProvider } from './LiveRegionContext';
import { notifyToast } from './toastBridge';

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LiveRegionProvider>
      <ToastProvider>{children}</ToastProvider>
    </LiveRegionProvider>
  );

  // Each visible toast carries one dismiss button; the message text alone is
  // ambiguous because the hidden live region repeats it for screen readers.
  const visibleToasts = () => screen.queryAllByRole('button', { name: 'Dismiss notification' });

  it('throws an error when useToast is used outside of ToastProvider', () => {
    expect(() => renderHook(() => useToast())).toThrow(
      'useToast must be used within a ToastProvider',
    );
  });

  it('addToast renders a toast and announces it through the live region', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Shipment created successfully', 'success');
      vi.advanceTimersByTime(100);
    });

    expect(visibleToasts()).toHaveLength(1);
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Shipment created successfully');
    // The toast itself is not a live region, so the message is announced once.
    expect(screen.getByRole('alert')).toHaveTextContent('');
  });

  it('uses assertive priority announcement for error toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Failed to connect wallet', 'error');
      vi.advanceTimersByTime(100);
    });

    expect(visibleToasts()).toHaveLength(1);
    const alertRegion = screen.getByRole('alert');
    expect(alertRegion).toHaveTextContent('Failed to connect wallet');
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('collapses toasts with the same id/key into one', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Connecting... (attempt 1)', 'info', undefined, 'conn-key');
    });
    expect(screen.getByText('Connecting... (attempt 1)')).toBeInTheDocument();

    act(() => {
      result.current.addToast('Connecting... (attempt 2)', 'info', undefined, 'conn-key');
    });

    expect(screen.queryByText('Connecting... (attempt 1)')).not.toBeInTheDocument();
    expect(screen.getByText('Connecting... (attempt 2)')).toBeInTheDocument();
  });

  it('limits displayed toasts to maximum 3', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Message 1', 'info');
      result.current.addToast('Message 2', 'info');
      result.current.addToast('Message 3', 'info');
      result.current.addToast('Message 4', 'info');
    });

    expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
    expect(screen.getByText('Message 2')).toBeInTheDocument();
    expect(screen.getByText('Message 3')).toBeInTheDocument();
    expect(screen.getByText('Message 4')).toBeInTheDocument();
  });

  it('handles auto-dismiss and manual close', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Auto dismiss toast', 'info', undefined, 'auto-close');
    });
    expect(screen.getByText('Auto dismiss toast')).toBeInTheDocument();

    // Fast-forward past 5000ms auto-dismiss timer inside Toast
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(visibleToasts()).toHaveLength(0);

    // Manual removeToast
    act(() => {
      result.current.addToast('Manual close toast', 'info', undefined, 'manual-id');
    });
    expect(visibleToasts()).toHaveLength(1);

    act(() => {
      result.current.removeToast('manual-id');
    });
    expect(visibleToasts()).toHaveLength(0);
  });

  it('does not restart an older toast\'s dismiss timer when a newer toast arrives', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('First', 'info', undefined, 'first');
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      result.current.addToast('Second', 'info', undefined, 'second');
    });
    expect(visibleToasts()).toHaveLength(2);

    // 5s after the first toast, but only 2s after the second.
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(visibleToasts()).toHaveLength(1);
  });

  it('supports toastBridge registration outside React', () => {
    render(
      <LiveRegionProvider>
        <ToastProvider>
          <div>App content</div>
        </ToastProvider>
      </LiveRegionProvider>,
    );

    act(() => {
      notifyToast('Bridge notification', 'warning', 'bridge-key');
    });

    expect(screen.getByText('Bridge notification')).toBeInTheDocument();
  });
});
