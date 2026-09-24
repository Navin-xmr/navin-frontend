import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const { getAllMock, getUnreadCountMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  getUnreadCountMock: vi.fn(),
}));

vi.mock('../../../services/api/endpoints/notifications', () => ({
  notificationsApi: {
    getAll: getAllMock,
    getUnreadCount: getUnreadCountMock,
  },
}));

const apiNotifications = [
  {
    id: 'n1',
    type: 'shipments',
    icon: 'shipment',
    title: 'Shipment #SH-2024-001 delivered',
    description: 'delivered successfully',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'n2',
    type: 'settlements',
    icon: 'payment',
    title: 'Payment of 5,000 XLM received',
    description: 'for shipment #SH-2024-002',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'n3',
    type: 'shipments',
    icon: 'alert',
    title: 'Shipment #SH-2024-003 delayed',
    description: 'due to weather conditions',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'n4',
    type: 'shipments',
    icon: 'shipment',
    title: 'New shipment #SH-2024-004 created',
    description: 'awaiting pickup',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'n5',
    type: 'settlements',
    icon: 'payment',
    title: 'Settlement completed',
    description: 'for 3 shipments totaling 15,000 XLM',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('NotificationDropdown', () => {
  beforeEach(() => {
    getAllMock.mockReset();
    getUnreadCountMock.mockReset();
    getAllMock.mockResolvedValue({
      data: apiNotifications,
      meta: { page: 1, limit: 5, total: 5, hasMore: false },
    });
    getUnreadCountMock.mockResolvedValue(3);
  });

  it('opens and displays notifications, closes on ESC and outside click', async () => {
    const user = userEvent.setup();

    renderWithRouter(<NotificationDropdown />);

    await waitFor(() => expect(getAllMock).toHaveBeenCalledTimes(1));

    const bell = screen.getByLabelText(/^Notifications/);
    await user.click(bell);

    expect(screen.getByText('Notifications')).toBeInTheDocument();

    const items = await screen.findAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(5);

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Notifications')).not.toBeInTheDocument());

    await user.click(bell);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    await user.click(document.body);
    await waitFor(() => expect(screen.queryByText('Notifications')).not.toBeInTheDocument());
  });

  it('renders the bell icon with unread badge from the API', async () => {
    renderWithRouter(<NotificationDropdown />);
    const bellButton = screen.getByLabelText(/^Notifications/);
    expect(bellButton).toBeInTheDocument();

    expect(await screen.findByText('3')).toBeInTheDocument();
  });

  it('opens dropdown when bell icon is clicked', async () => {
    renderWithRouter(<NotificationDropdown />);

    const bellButton = screen.getByLabelText(/^Notifications/);
    await userEvent.click(bellButton);

    expect(await screen.findByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('View All Notifications')).toBeInTheDocument();
  });

  it('displays notifications returned by the API in the dropdown', async () => {
    renderWithRouter(<NotificationDropdown />);

    const bellButton = screen.getByLabelText(/^Notifications/);
    await userEvent.click(bellButton);

    expect(await screen.findByText(/Shipment #SH-2024-001 delivered/)).toBeInTheDocument();
    expect(screen.getByText(/Payment of 5,000 XLM received/)).toBeInTheDocument();
    expect(screen.getByText(/Shipment #SH-2024-003 delayed/)).toBeInTheDocument();
  });

  it('closes dropdown when close button is clicked', async () => {
    renderWithRouter(<NotificationDropdown />);

    const bellButton = screen.getByLabelText(/^Notifications/);
    await userEvent.click(bellButton);
    await screen.findByText('Notifications');

    const closeButton = screen.getByLabelText('Close notifications');
    await userEvent.click(closeButton);

    expect(screen.queryByText('View All Notifications')).not.toBeInTheDocument();
  });

  it('closes dropdown when ESC key is pressed', async () => {
    renderWithRouter(<NotificationDropdown />);

    const bellButton = screen.getByLabelText(/^Notifications/);
    await userEvent.click(bellButton);
    await screen.findByText('Notifications');

    expect(screen.getByText('View All Notifications')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByText('View All Notifications')).not.toBeInTheDocument();
  });
});