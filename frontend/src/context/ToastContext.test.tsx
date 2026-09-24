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

  it('throws an error when useToast is used outside of ToastProvider', () => {
    expect(() => renderHook(() => useToast())).toThrow(
      'useToast must be used within a ToastProvider',
    );
  });

  it('addToast renders a toast and announces it through the live region', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Shipment created successfully', 'success');
      vi.runAllTimers();
    });

    expect(screen.getByText('Shipment created successfully')).toBeInTheDocument();
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Shipment created successfully');
  });

  it('uses assertive priority announcement for error toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Failed to connect wallet', 'error');
      vi.runAllTimers();
    });

    expect(screen.getByText('Failed to connect wallet')).toBeInTheDocument();
    const alertRegion = screen.getByRole('alert');
    expect(alertRegion).toHaveTextContent('Failed to connect wallet');
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
    expect(screen.queryByText('Auto dismiss toast')).not.toBeInTheDocument();

    // Manual removeToast
    act(() => {
      result.current.addToast('Manual close toast', 'info', undefined, 'manual-id');
    });
    expect(screen.getByText('Manual close toast')).toBeInTheDocument();

    act(() => {
      result.current.removeToast('manual-id');
    });
    expect(screen.queryByText('Manual close toast')).not.toBeInTheDocument();
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
