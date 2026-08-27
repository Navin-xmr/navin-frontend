import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usersApi, invitationsApi } from './users';
import type { User, Invitation, PaginatedUsers } from './users';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '../client';

const mockApiClient = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const mockUser: User = {
  _id: 'user-1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: 'Admin',
  status: 'Active',
};

const mockInvitation: Invitation = {
  _id: 'inv-1',
  email: 'new@example.com',
  role: 'Viewer',
  status: 'pending',
  createdAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2026-01-08T00:00:00.000Z',
};

describe('usersApi endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getAll requests users with query params and returns the paginated payload', async () => {
    const paginated: PaginatedUsers = { data: [mockUser], page: 1, limit: 20, total: 1 };
    mockApiClient.get.mockResolvedValueOnce({ data: { data: paginated } });

    const result = await usersApi.getAll({ page: 1, limit: 20 });

    expect(mockApiClient.get).toHaveBeenCalledWith('/users', { params: { page: 1, limit: 20 } });
    expect(result).toEqual(paginated);
  });

  it('getAll propagates rejection from the client', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('network error'));

    await expect(usersApi.getAll()).rejects.toThrow('network error');
  });

  it('invite posts the invite payload and returns the created user', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { data: mockUser } });

    const result = await usersApi.invite({ email: 'jane@example.com', role: 'Admin' });

    expect(mockApiClient.post).toHaveBeenCalledWith('/users/invite', { email: 'jane@example.com', role: 'Admin' });
    expect(result).toEqual(mockUser);
  });

  it('updateRole patches the role for the user id', async () => {
    mockApiClient.patch.mockResolvedValueOnce({ data: { data: { ...mockUser, role: 'Manager' } } });

    const result = await usersApi.updateRole('user-1', 'Manager');

    expect(mockApiClient.patch).toHaveBeenCalledWith('/users/user-1/role', { role: 'Manager' });
    expect(result.role).toBe('Manager');
  });

  it('deactivate patches the deactivate endpoint for the user id', async () => {
    mockApiClient.patch.mockResolvedValueOnce({ data: { data: { ...mockUser, status: 'Inactive' } } });

    const result = await usersApi.deactivate('user-1');

    expect(mockApiClient.patch).toHaveBeenCalledWith('/users/user-1/deactivate');
    expect(result.status).toBe('Inactive');
  });

  it('activate patches the activate endpoint for the user id', async () => {
    mockApiClient.patch.mockResolvedValueOnce({ data: { data: mockUser } });

    const result = await usersApi.activate('user-1');

    expect(mockApiClient.patch).toHaveBeenCalledWith('/users/user-1/activate');
    expect(result.status).toBe('Active');
  });
});

describe('invitationsApi endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('list returns the unwrapped invitation list', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: { data: [mockInvitation] } });

    const result = await invitationsApi.list();

    expect(mockApiClient.get).toHaveBeenCalledWith('/company/invitations');
    expect(result).toEqual([mockInvitation]);
  });

  it('send posts the invite payload', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { data: mockInvitation } });

    const result = await invitationsApi.send({ email: 'new@example.com', role: 'Viewer' });

    expect(mockApiClient.post).toHaveBeenCalledWith('/company/invitations', { email: 'new@example.com', role: 'Viewer' });
    expect(result).toEqual(mockInvitation);
  });

  it('resend posts to the resend endpoint for the invitation id', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { data: mockInvitation } });

    const result = await invitationsApi.resend('inv-1');

    expect(mockApiClient.post).toHaveBeenCalledWith('/company/invitations/inv-1/resend');
    expect(result).toEqual(mockInvitation);
  });

  it('revoke calls delete for the invitation id and returns nothing', async () => {
    mockApiClient.delete.mockResolvedValueOnce(undefined);

    const result = await invitationsApi.revoke('inv-1');

    expect(mockApiClient.delete).toHaveBeenCalledWith('/company/invitations/inv-1');
    expect(result).toBeUndefined();
  });

  it('accept posts the token/password/name payload and returns an auth token', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { data: { token: 'auth-token-123' } } });

    const result = await invitationsApi.accept({ token: 'tok-1', password: 'Secret123!', name: 'Jane Doe' });

    expect(mockApiClient.post).toHaveBeenCalledWith('/company/invitations/accept', {
      token: 'tok-1',
      password: 'Secret123!',
      name: 'Jane Doe',
    });
    expect(result).toEqual({ token: 'auth-token-123' });
  });

  it('getInfo requests invitation info with the token query param', async () => {
    const info = { companyName: 'Acme', role: 'Viewer' as const, email: 'new@example.com' };
    mockApiClient.get.mockResolvedValueOnce({ data: { data: info } });

    const result = await invitationsApi.getInfo('tok-1');

    expect(mockApiClient.get).toHaveBeenCalledWith('/company/invitations/info?token=tok-1');
    expect(result).toEqual(info);
  });

  it('getInfo propagates rejection from the client', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('invalid token'));

    await expect(invitationsApi.getInfo('bad-token')).rejects.toThrow('invalid token');
  });
});
