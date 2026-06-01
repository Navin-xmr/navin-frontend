import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usersApi } from './users';
import type { User, InviteUserRequest, UpdateRoleRequest } from './users';

// ─── Mock axios client ────────────────────────────────────────────────────────

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

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser: User = {
  _id: 'user-001',
  name: 'Alice Smith',
  email: 'alice@navin.com',
  role: 'Admin',
  status: 'Active',
  lastLogin: '2024-03-15T10:30:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-03-15T10:30:00.000Z',
};

const mockUser2: User = {
  _id: 'user-002',
  name: 'Bob Johnson',
  email: 'bob@navin.com',
  role: 'Manager',
  status: 'Active',
  lastLogin: '2024-03-14T14:15:00.000Z',
  createdAt: '2024-01-02T00:00:00.000Z',
  updatedAt: '2024-03-14T14:15:00.000Z',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('usersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('calls GET /users and returns user list', async () => {
      const mockResponse = { data: { data: [mockUser, mockUser2] } };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await usersApi.getAll();

      expect(mockApiClient.get).toHaveBeenCalledOnce();
      expect(mockApiClient.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual([mockUser, mockUser2]);
    });

    it('returns empty array when no users exist', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: [] } });

      const result = await usersApi.getAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('propagates network errors', async () => {
      const networkError = new Error('Network Error');
      mockApiClient.get.mockRejectedValueOnce(networkError);

      await expect(usersApi.getAll()).rejects.toThrow('Network Error');
    });
  });

  describe('invite', () => {
    it('calls POST /users/invite with correct payload', async () => {
      const inviteRequest: InviteUserRequest = {
        email: 'newuser@navin.com',
        role: 'Viewer',
      };
      const mockResponse = { data: { data: { ...mockUser, ...inviteRequest } } };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await usersApi.invite(inviteRequest);

      expect(mockApiClient.post).toHaveBeenCalledOnce();
      expect(mockApiClient.post).toHaveBeenCalledWith('/users/invite', inviteRequest);
      expect(result.email).toBe(inviteRequest.email);
      expect(result.role).toBe(inviteRequest.role);
    });

    it('handles Admin role invitation', async () => {
      const inviteRequest: InviteUserRequest = {
        email: 'admin@navin.com',
        role: 'Admin',
      };
      mockApiClient.post.mockResolvedValueOnce({ data: { data: mockUser } });

      await usersApi.invite(inviteRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/users/invite', inviteRequest);
    });

    it('propagates validation errors', async () => {
      const inviteRequest: InviteUserRequest = {
        email: 'invalid-email',
        role: 'Viewer',
      };
      const validationError = new Error('Invalid email format');
      mockApiClient.post.mockRejectedValueOnce(validationError);

      await expect(usersApi.invite(inviteRequest)).rejects.toThrow('Invalid email format');
    });
  });

  describe('updateRole', () => {
    it('calls PATCH /users/:id/role with correct payload', async () => {
      const updateRequest: UpdateRoleRequest = { role: 'Manager' };
      const updatedUser = { ...mockUser, role: 'Manager' as const };
      mockApiClient.patch.mockResolvedValueOnce({ data: { data: updatedUser } });

      const result = await usersApi.updateRole('user-001', updateRequest);

      expect(mockApiClient.patch).toHaveBeenCalledOnce();
      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/user-001/role', updateRequest);
      expect(result.role).toBe('Manager');
    });

    it('handles role change to Admin', async () => {
      const updateRequest: UpdateRoleRequest = { role: 'Admin' };
      const updatedUser = { ...mockUser, role: 'Admin' as const };
      mockApiClient.patch.mockResolvedValueOnce({ data: { data: updatedUser } });

      const result = await usersApi.updateRole('user-002', updateRequest);

      expect(result.role).toBe('Admin');
    });

    it('propagates 404 errors for non-existent users', async () => {
      const updateRequest: UpdateRoleRequest = { role: 'Viewer' };
      const notFoundError = Object.assign(new Error('User not found'), { response: { status: 404 } });
      mockApiClient.patch.mockRejectedValueOnce(notFoundError);

      await expect(usersApi.updateRole('invalid-id', updateRequest)).rejects.toThrow('User not found');
    });
  });

  describe('deactivate', () => {
    it('calls PATCH /users/:id/deactivate', async () => {
      const deactivatedUser = { ...mockUser, status: 'Inactive' as const };
      mockApiClient.patch.mockResolvedValueOnce({ data: { data: deactivatedUser } });

      const result = await usersApi.deactivate('user-001');

      expect(mockApiClient.patch).toHaveBeenCalledOnce();
      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/user-001/deactivate');
      expect(result.status).toBe('Inactive');
    });

    it('propagates authorization errors', async () => {
      const authError = Object.assign(new Error('Unauthorized'), { response: { status: 403 } });
      mockApiClient.patch.mockRejectedValueOnce(authError);

      await expect(usersApi.deactivate('user-001')).rejects.toThrow('Unauthorized');
    });
  });

  describe('delete', () => {
    it('calls DELETE /users/:id', async () => {
      mockApiClient.delete.mockResolvedValueOnce({ data: {} });

      await usersApi.delete('user-001');

      expect(mockApiClient.delete).toHaveBeenCalledOnce();
      expect(mockApiClient.delete).toHaveBeenCalledWith('/users/user-001');
    });

    it('returns void on successful deletion', async () => {
      mockApiClient.delete.mockResolvedValueOnce({ data: {} });

      const result = await usersApi.delete('user-001');

      expect(result).toBeUndefined();
    });

    it('propagates 404 errors for non-existent users', async () => {
      const notFoundError = Object.assign(new Error('User not found'), { response: { status: 404 } });
      mockApiClient.delete.mockRejectedValueOnce(notFoundError);

      await expect(usersApi.delete('invalid-id')).rejects.toThrow('User not found');
    });
  });
});
