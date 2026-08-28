import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '../client';
import {
  notificationPreferencesApi,
  notificationsApi,
  type Notification,
  type NotificationPreference,
} from './notifications';

const mockApiClient = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('notificationPreferencesApi.getPreferences', () => {
  it('maps the preferences array into a record keyed by event type', async () => {
    const data: NotificationPreference[] = [
      { event: 'shipment_created', email: true, sms: false },
      { event: 'payment_received', email: false, sms: true },
    ];
    mockApiClient.get.mockResolvedValueOnce({ data: { data } });

    const result = await notificationPreferencesApi.getPreferences();

    expect(mockApiClient.get).toHaveBeenCalledWith('/notifications/preferences');
    expect(result).toEqual({
      shipment_created: { email: true, sms: false },
      payment_received: { email: false, sms: true },
    });
  });

  it('returns an empty object when the API returns no preferences', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: { data: [] } });

    const result = await notificationPreferencesApi.getPreferences();

    expect(result).toEqual({});
  });

  it('propagates a rejection from the API', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(notificationPreferencesApi.getPreferences()).rejects.toThrow('Network error');
  });
});

describe('notificationPreferencesApi.updatePreference', () => {
  it('sends event, channel, and enabled flag in the PATCH body', async () => {
    mockApiClient.patch.mockResolvedValueOnce({});

    await notificationPreferencesApi.updatePreference('status_changed', 'sms', true);

    expect(mockApiClient.patch).toHaveBeenCalledWith('/notifications/preferences', {
      event: 'status_changed',
      channel: 'sms',
      enabled: true,
    });
  });

  it('propagates a rejection from the API', async () => {
    mockApiClient.patch.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      notificationPreferencesApi.updatePreference('status_changed', 'email', false),
    ).rejects.toThrow('Update failed');
  });
});

describe('notificationPreferencesApi phone verification', () => {
  it('sendOtp posts the phone number', async () => {
    mockApiClient.post.mockResolvedValueOnce({});

    await notificationPreferencesApi.sendOtp('+15550001234');

    expect(mockApiClient.post).toHaveBeenCalledWith('/notifications/phone/send-otp', {
      phone: '+15550001234',
    });
  });

  it('verifyOtp posts the phone number and code', async () => {
    mockApiClient.post.mockResolvedValueOnce({});

    await notificationPreferencesApi.verifyOtp('+15550001234', '123456');

    expect(mockApiClient.post).toHaveBeenCalledWith('/notifications/phone/verify-otp', {
      phone: '+15550001234',
      otp: '123456',
    });
  });

  it('propagates a rejection when OTP verification fails', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('Invalid OTP'));

    await expect(notificationPreferencesApi.verifyOtp('+1', '000000')).rejects.toThrow(
      'Invalid OTP',
    );
  });
});

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'notif-1',
  type: 'shipments',
  icon: 'shipment',
  title: 'Shipment update',
  description: 'Your shipment is in transit',
  timestamp: '2026-01-01T00:00:00.000Z',
  isRead: false,
  ...overrides,
});

describe('notificationsApi.getAll', () => {
  it('passes pagination and filter params through to the API', async () => {
    const data = [makeNotification()];
    const meta = { page: 2, limit: 20, total: 21, hasMore: false };
    mockApiClient.get.mockResolvedValueOnce({ data: { data, meta } });

    const result = await notificationsApi.getAll({ page: 2, limit: 20, type: 'shipments', q: 'NAV' });

    expect(mockApiClient.get).toHaveBeenCalledWith('/notifications', {
      params: { page: 2, limit: 20, type: 'shipments', q: 'NAV' },
    });
    expect(result).toEqual({ data, meta });
  });

  it('calls the API with no params when none are provided', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: { data: [], meta: { page: 1, limit: 20, total: 0, hasMore: false } },
    });

    await notificationsApi.getAll();

    expect(mockApiClient.get).toHaveBeenCalledWith('/notifications', { params: undefined });
  });

  it('propagates a rejection from the API', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(notificationsApi.getAll()).rejects.toThrow('Network error');
  });
});

describe('notificationsApi.markAsRead', () => {
  it('PATCHes the notification read endpoint with the given id', async () => {
    mockApiClient.patch.mockResolvedValueOnce({});

    await notificationsApi.markAsRead('notif-1');

    expect(mockApiClient.patch).toHaveBeenCalledWith('/notifications/notif-1/read');
  });

  it('propagates a rejection from the API', async () => {
    mockApiClient.patch.mockRejectedValueOnce(new Error('Not found'));

    await expect(notificationsApi.markAsRead('missing')).rejects.toThrow('Not found');
  });
});

describe('notificationsApi.markAllAsRead', () => {
  it('POSTs to the read-all endpoint', async () => {
    mockApiClient.post.mockResolvedValueOnce({});

    await notificationsApi.markAllAsRead();

    expect(mockApiClient.post).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('propagates a rejection from the API', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('Server error'));

    await expect(notificationsApi.markAllAsRead()).rejects.toThrow('Server error');
  });
});

describe('notificationsApi.deleteOne', () => {
  it('DELETEs the notification by id', async () => {
    mockApiClient.delete.mockResolvedValueOnce({});

    await notificationsApi.deleteOne('notif-1');

    expect(mockApiClient.delete).toHaveBeenCalledWith('/notifications/notif-1');
  });

  it('propagates a rejection from the API', async () => {
    mockApiClient.delete.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(notificationsApi.deleteOne('notif-1')).rejects.toThrow('Forbidden');
  });
});

describe('notificationsApi.getUnreadCount', () => {
  it('returns the unread count from the response', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: { data: { unreadCount: 7 } } });

    const result = await notificationsApi.getUnreadCount();

    expect(mockApiClient.get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(result).toBe(7);
  });

  it('propagates a rejection from the API', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(notificationsApi.getUnreadCount()).rejects.toThrow('Network error');
  });
});
