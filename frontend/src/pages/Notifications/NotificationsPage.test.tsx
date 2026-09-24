import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { LiveRegionProvider } from '../../context/LiveRegionContext';
import NotificationsPage from './NotificationsPage';
import type { Notification } from '../../services/api/endpoints/notifications';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../services/api/endpoints/notifications', () => ({
  notificationsApi: {
    getAll: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteOne: vi.fn(),
    getUnreadCount: vi.fn(),
  },
}));

vi.mock('@services/realtime/realtimeService', () => ({
  realtimeService: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  },
}));

import { notificationsApi } from '../../services/api/endpoints/notifications';
import { realtimeService } from '@services/realtime/realtimeService';

const mockGetAll = notificationsApi.getAll as ReturnType<typeof vi.fn>;
const mockMarkAsRead = notificationsApi.markAsRead as ReturnType<typeof vi.fn>;
const mockMarkAllAsRead = notificationsApi.markAllAsRead as ReturnType<typeof vi.fn>;
const mockDeleteOne = notificationsApi.deleteOne as ReturnType<typeof vi.fn>;
const mockGetUnreadCount = notificationsApi.getUnreadCount as ReturnType<typeof vi.fn>;
const mockSubscribe = realtimeService.subscribe as ReturnType<typeof vi.fn>;

const renderPage = () =>
  render(
    <MemoryRouter>
      <LiveRegionProvider>
        <ToastProvider>
          <NotificationsPage />
        </ToastProvider>
      </LiveRegionProvider>
    </MemoryRouter>,
  );

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'n1',
  type: 'shipments',
  icon: 'shipment',
  title: 'Shipment update',
  description: 'Your shipment is in transit',
  timestamp: '2026-01-05T10:00:00.000Z',
  isRead: false,
  ...overrides,
});

const notif1 = makeNotification({
  id: 'n1',
  type: 'shipments',
  icon: 'shipment',
  title: 'Shipment in transit',
  timestamp: '2026-01-05T10:00:00.000Z',
  isRead: false,
  shipmentId: 'ship-1',
  trackingNumber: 'NAV-001',
});
const notif2 = makeNotification({
  id: 'n2',
  type: 'settlements',
  icon: 'payment',
  title: 'Payment received',
  timestamp: '2026-01-04T10:00:00.000Z',
  isRead: true,
});
const notif3 = makeNotification({
  id: 'n3',
  type: 'system',
  icon: 'system',
  title: 'System alert',
  timestamp: '2026-01-03T10:00:00.000Z',
  isRead: false,
});

const defaultMeta = { page: 1, limit: 20, total: 3, hasMore: false };

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  localStorage.clear();
  mockGetUnreadCount.mockResolvedValue(2);
  mockGetAll.mockResolvedValue({ data: [notif1, notif2, notif3], meta: defaultMeta });
  mockMarkAsRead.mockResolvedValue(undefined);
  mockMarkAllAsRead.mockResolvedValue(undefined);
  mockDeleteOne.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('rendering', () => {
  it('renders the page heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
    await waitFor(() => expect(mockGetAll).toHaveBeenCalled());
  });

  it('renders notifications returned by the API', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());
    expect(screen.getByText('Payment received')).toBeInTheDocument();
    expect(screen.getByText('System alert')).toBeInTheDocument();
  });

  it('shows the empty state when there are no notifications', async () => {
    mockGetAll.mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, hasMore: false } });
    renderPage();

    await waitFor(() => expect(screen.getByText('No notifications found')).toBeInTheDocument());
  });

  it('shows an error banner when fetching notifications fails', async () => {
    mockGetAll.mockRejectedValueOnce(new Error('Network error'));
    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Unable to load notifications. Please try again.')).toBeInTheDocument(),
    );
  });

  it('groups unread notifications under a "TODAY" heading and read ones under "EARLIER"', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());
    expect(screen.getByText('TODAY')).toBeInTheDocument();
    expect(screen.getByText('EARLIER')).toBeInTheDocument();
  });
});

describe('filters', () => {
  it('requests the API with the type filter when a category tab is clicked', async () => {
    renderPage();
    await waitFor(() => expect(mockGetAll).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /Shipments/ }));

    await waitFor(() =>
      expect(mockGetAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'shipments', page: 1 }),
      ),
    );
  });

  it('filters to unread notifications client-side via the read-state tabs', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('tab', { name: /Unread/ }));

    expect(screen.getByText('Shipment in transit')).toBeInTheDocument();
    expect(screen.getByText('System alert')).toBeInTheDocument();
    expect(screen.queryByText('Payment received')).not.toBeInTheDocument();
  });

  it('filters to read notifications client-side via the read-state tabs', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('tab', { name: /^Read/ }));

    expect(screen.getByText('Payment received')).toBeInTheDocument();
    expect(screen.queryByText('Shipment in transit')).not.toBeInTheDocument();
  });
});

describe('mark all as read', () => {
  it('is disabled when there are no unread notifications', async () => {
    mockGetUnreadCount.mockResolvedValue(0);
    mockGetAll.mockResolvedValue({
      data: [makeNotification({ id: 'n1', isRead: true })],
      meta: { page: 1, limit: 20, total: 1, hasMore: false },
    });
    renderPage();

    await waitFor(() => expect(screen.getByText('Shipment update')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Mark all as read/ })).toBeDisabled();
  });

  it('marks every notification as read and zeroes the unread count', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Mark all as read/ }));

    await waitFor(() => expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole('button', { name: /Mark all as read/ })).toBeDisabled());
  });

  it('shows an error banner when marking all as read fails', async () => {
    mockMarkAllAsRead.mockRejectedValueOnce(new Error('Server error'));
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Mark all as read/ }));

    await waitFor(() =>
      expect(
        screen.getByText('Could not mark all notifications as read. Please try again.'),
      ).toBeInTheDocument(),
    );
  });
});

describe('notification click', () => {
  it('marks an unread notification as read and navigates to the shipment', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Shipment in transit'));

    await waitFor(() => expect(mockMarkAsRead).toHaveBeenCalledWith('n1'));
    expect(navigateMock).toHaveBeenCalledWith('/dashboard/shipments/ship-1');
  });

  it('does not call markAsRead again for an already-read notification, but still navigates if resolvable', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Payment received')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Payment received'));

    expect(mockMarkAsRead).not.toHaveBeenCalled();
  });

  it('deletes a notification via the delete button', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    const card = screen.getByText('Shipment in transit').closest('[role="article"]') as HTMLElement;
    fireEvent.click(within(card).getByRole('button', { name: 'Delete notification' }));

    await waitFor(() => expect(mockDeleteOne).toHaveBeenCalledWith('n1'));
    await waitFor(() => expect(screen.queryByText('Shipment in transit')).not.toBeInTheDocument());
  });
});

describe('bulk selection', () => {
  it('selects an individual notification and shows the bulk action bar', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Select notification: Shipment in transit'));

    const toolbar = screen.getByRole('toolbar', { name: 'Bulk notification actions' });
    expect(toolbar).toBeInTheDocument();
    expect(within(toolbar).getByText('1 selected')).toBeInTheDocument();
  });

  it('select-all selects every visible notification', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Select all visible notifications'));

    const toolbar = screen.getByRole('toolbar', { name: 'Bulk notification actions' });
    expect(within(toolbar).getByText('3 selected')).toBeInTheDocument();
  });

  it('bulk marks selected notifications as read via the action bar', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Select notification: Shipment in transit'));
    fireEvent.click(screen.getByLabelText('Select notification: System alert'));

    const toolbar = screen.getByRole('toolbar', { name: 'Bulk notification actions' });
    fireEvent.click(within(toolbar).getByRole('button', { name: /Mark as read/ }));

    await waitFor(() => expect(mockMarkAsRead).toHaveBeenCalledWith('n1'));
    expect(mockMarkAsRead).toHaveBeenCalledWith('n3');
    await waitFor(() =>
      expect(screen.queryByRole('toolbar', { name: 'Bulk notification actions' })).not.toBeInTheDocument(),
    );
  });

  it('bulk deletes selected notifications after confirming the dialog', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Select notification: Shipment in transit'));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Delete selected notifications?')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(mockDeleteOne).toHaveBeenCalledWith('n1'));
    await waitFor(() => expect(screen.queryByText('Shipment in transit')).not.toBeInTheDocument());
  });

  it('clears the selection via the bulk action bar clear button', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Select notification: Shipment in transit'));
    fireEvent.click(screen.getByLabelText('Clear selection'));

    expect(screen.queryByRole('toolbar', { name: 'Bulk notification actions' })).not.toBeInTheDocument();
  });
});

describe('pagination', () => {
  it('shows a "Load more" button when more pages are available and fetches the next page', async () => {
    mockGetAll
      .mockResolvedValueOnce({
        data: [notif1],
        meta: { page: 1, limit: 20, total: 2, hasMore: true },
      })
      .mockResolvedValueOnce({
        data: [notif2],
        meta: { page: 2, limit: 20, total: 2, hasMore: false },
      });
    renderPage();

    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());
    const loadMoreButton = screen.getByRole('button', { name: /Load more notifications/ });

    fireEvent.click(loadMoreButton);

    await waitFor(() =>
      expect(mockGetAll).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })),
    );
    await waitFor(() => expect(screen.getByText('Payment received')).toBeInTheDocument());
  });

  it('does not show a "Load more" button when there are no additional pages', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    expect(screen.queryByRole('button', { name: /Load more notifications/ })).not.toBeInTheDocument();
  });
});

describe('realtime updates', () => {
  it('prepends a new notification received over the realtime stream', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    const handler = mockSubscribe.mock.calls.find(([type]) => type === 'notification:new')?.[1];
    expect(handler).toBeDefined();

    handler?.({
      type: 'notification:new',
      notification: {
        id: 'realtime-1',
        type: 'system',
        title: 'Live update',
        description: 'A brand new event',
        timestamp: '2026-01-06T00:00:00.000Z',
        isRead: false,
      },
    });

    await waitFor(() => expect(screen.getByText('Live update')).toBeInTheDocument());
  });

  it('unsubscribes from the realtime stream on unmount', async () => {
    const { unmount } = renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    unmount();

    expect(realtimeService.unsubscribe).toHaveBeenCalledWith('notification:new', expect.any(Function));
  });
});

describe('grouping', () => {
  it('groups notifications by shipment when the Grouped toggle is enabled', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Shipment in transit')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Ungrouped' }));

    expect(screen.getByText('NAV-001')).toBeInTheDocument();
    expect(screen.getByText('1 updates')).toBeInTheDocument();
  });
});
