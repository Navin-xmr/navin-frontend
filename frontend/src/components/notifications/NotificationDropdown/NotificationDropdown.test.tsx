import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

// ─── Mock notifications API ───────────────────────────────────────────────────

vi.mock('../../../services/api/endpoints/notifications', () => ({
  notificationsApi: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: '1', icon: 'shipment', title: 'Shipment Delivered', message: 'Shipment #SH-2024-001 has been delivered successfully', read: false, createdAt: new Date().toISOString(), link: null },
        { id: '2', icon: 'payment',  title: 'Payment Received',  message: 'Payment of 5,000 XLM received', read: false, createdAt: new Date().toISOString(), link: null },
        { id: '3', icon: 'alert',    title: 'Shipment Delayed',  message: 'Shipment #SH-2024-003 is delayed', read: true,  createdAt: new Date().toISOString(), link: null },
        { id: '4', icon: 'shipment', title: 'Pickup Confirmed',  message: 'Shipment #SH-2024-004 pickup confirmed', read: true, createdAt: new Date().toISOString(), link: null },
        { id: '5', icon: 'payment',  title: 'Settlement Done',   message: 'Settlement completed for SH-2024-002', read: true, createdAt: new Date().toISOString(), link: null },
      ],
    }),
    getUnreadCount: vi.fn().mockResolvedValue(3),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renderWithRouter = (component: React.ReactElement) =>
  render(<MemoryRouter>{component}</MemoryRouter>);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NotificationDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the bell icon with unread badge', async () => {
    renderWithRouter(<NotificationDropdown />);

    const bellButton = screen.getByLabelText(/^Notifications/);
    expect(bellButton).toBeInTheDocument();

    // Badge shows unread count after API resolves
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('opens dropdown when bell icon is clicked', async () => {
    renderWithRouter(<NotificationDropdown />);

    const bellButton = screen.getByLabelText(/^Notifications/);
    fireEvent.click(bellButton);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('View All Notifications')).toBeInTheDocument();
  });

  it('opens and displays notifications, closes on ESC and outside click', async () => {
    const user = userEvent.setup();
    renderWithRouter(<NotificationDropdown />);

    const bell = screen.getByLabelText(/^Notifications/);
    await user.click(bell);

    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // Wait for API data to render
    await waitFor(() => {
      const items = screen.getAllByRole('listitem');
      expect(items.length).toBeGreaterThanOrEqual(5);
    });

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByText('View All Notifications')).not.toBeInTheDocument(),
    );

    await user.click(bell);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    await user.click(document.body);
    await waitFor(() =>
      expect(screen.queryByText('View All Notifications')).not.toBeInTheDocument(),
    );
  });

  it('displays 5 notifications in the dropdown', async () => {
    renderWithRouter(<NotificationDropdown />);

    const bellButton = screen.getByLabelText(/^Notifications/);
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Shipment Delivered')).toBeInTheDocument();
      expect(screen.getByText('Payment Received')).toBeInTheDocument();
      expect(screen.getByText('Shipment Delayed')).toBeInTheDocument();
    });
  });

  it('closes dropdown when close button is clicked', () => {
    renderWithRouter(<NotificationDropdown />);

    const bellButton = screen.getByLabelText(/^Notifications/);
    fireEvent.click(bellButton);

    const closeButton = screen.getByLabelText('Close notifications');
    fireEvent.click(closeButton);

    expect(screen.queryByText('View All Notifications')).not.toBeInTheDocument();
  });

  it('closes dropdown when ESC key is pressed', () => {
    renderWithRouter(<NotificationDropdown />);

    const bellButton = screen.getByLabelText(/^Notifications/);
    fireEvent.click(bellButton);

    expect(screen.getByText('View All Notifications')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByText('View All Notifications')).not.toBeInTheDocument();
  });
});
