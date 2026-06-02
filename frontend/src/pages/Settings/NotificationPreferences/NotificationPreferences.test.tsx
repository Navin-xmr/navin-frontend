import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NotificationPreferences from './NotificationPreferences';

describe('NotificationPreferences', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all required notification categories', () => {
    render(<NotificationPreferences />);

    expect(screen.getByLabelText('Shipment Updates in-app notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment Alerts in-app notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Delivery Confirmations in-app notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('System Announcements in-app notifications')).toBeInTheDocument();
  });

  it('updates toggle states when a category is clicked', () => {
    render(<NotificationPreferences />);

    const shipmentUpdates = screen.getByLabelText('Shipment Updates in-app notifications') as HTMLInputElement;
    expect(shipmentUpdates.checked).toBe(true);

    fireEvent.click(shipmentUpdates);
    expect(shipmentUpdates.checked).toBe(false);
  });

  it('shows save loading state and success feedback', () => {
    vi.useFakeTimers();
    render(<NotificationPreferences />);

    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));

    expect(screen.getByRole('button', { name: /saving.../i })).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(screen.getByText('Preferences saved successfully!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save preferences/i })).toBeEnabled();
  });
});
