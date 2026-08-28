import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authApi } from './auth';
import type { AuthResponse } from './auth';

vi.mock('../client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

vi.mock('@sentry/react', () => ({
  setUser: vi.fn(),
}));

import { apiClient } from '../client';
import * as Sentry from '@sentry/react';

const mockApiClient = apiClient as unknown as { post: ReturnType<typeof vi.fn> };
const mockSentry = Sentry as unknown as { setUser: ReturnType<typeof vi.fn> };

// === Fixtures

const mockAuthResponse: AuthResponse = {
  user: {
    id: 'user-001',
    email: 'jane@navin.io',
    name: 'Jane Doe',
    role: 'ADMIN',
  },
  token: 'jwt-token-001',
};

describe('authApi endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('posts credentials and returns the unwrapped auth payload', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { data: mockAuthResponse } });

      const result = await authApi.login({ email: 'jane@navin.io', password: 'secret' });

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'jane@navin.io',
        password: 'secret',
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('persists the token and identifies the user in Sentry', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { data: mockAuthResponse } });

      await authApi.login({ email: 'jane@navin.io', password: 'secret' });

      expect(localStorage.getItem('authToken')).toBe('jwt-token-001');
      expect(mockSentry.setUser).toHaveBeenCalledWith({
        id: 'user-001',
        email: 'jane@navin.io',
        username: 'ADMIN',
      });
    });

    it('propagates a rejected request and stores no token', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(
        authApi.login({ email: 'jane@navin.io', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(mockSentry.setUser).not.toHaveBeenCalled();
    });
  });

  describe('signup', () => {
    it('posts the signup payload and returns the unwrapped auth payload', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { data: mockAuthResponse } });

      const result = await authApi.signup({
        email: 'jane@navin.io',
        password: 'secret',
        name: 'Jane Doe',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/signup', {
        email: 'jane@navin.io',
        password: 'secret',
        name: 'Jane Doe',
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('forwards an optional organizationId', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { data: mockAuthResponse } });

      await authApi.signup({
        email: 'jane@navin.io',
        password: 'secret',
        name: 'Jane Doe',
        organizationId: 'org-42',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/signup',
        expect.objectContaining({ organizationId: 'org-42' })
      );
    });

    it('persists the token and identifies the user in Sentry', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { data: mockAuthResponse } });

      await authApi.signup({ email: 'jane@navin.io', password: 'secret', name: 'Jane Doe' });

      expect(localStorage.getItem('authToken')).toBe('jwt-token-001');
      expect(mockSentry.setUser).toHaveBeenCalledWith({
        id: 'user-001',
        email: 'jane@navin.io',
        username: 'ADMIN',
      });
    });

    it('propagates a rejected request and stores no token', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Email already in use'));

      await expect(
        authApi.signup({ email: 'jane@navin.io', password: 'secret', name: 'Jane Doe' })
      ).rejects.toThrow('Email already in use');

      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('registerCompany', () => {
    it('posts the company registration payload', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: {} });

      const payload = {
        companyName: 'Navin Logistics',
        industry: 'Logistics',
        country: 'Nigeria',
        companySize: '11-50',
        adminName: 'Jane Doe',
        email: 'jane@navin.io',
        password: 'secret',
      };

      await expect(authApi.registerCompany(payload)).resolves.toBeUndefined();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register/company', payload);
    });

    it('does not store a token on success', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: {} });

      await authApi.registerCompany({
        companyName: 'Navin Logistics',
        industry: 'Logistics',
        country: 'Nigeria',
        companySize: '11-50',
        adminName: 'Jane Doe',
        email: 'jane@navin.io',
        password: 'secret',
      });

      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('propagates a rejected request', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Company already registered'));

      await expect(
        authApi.registerCompany({
          companyName: 'Navin Logistics',
          industry: 'Logistics',
          country: 'Nigeria',
          companySize: '11-50',
          adminName: 'Jane Doe',
          email: 'jane@navin.io',
          password: 'secret',
        })
      ).rejects.toThrow('Company already registered');
    });
  });

  describe('logout', () => {
    it('posts to the logout endpoint, clears the token and the Sentry user', async () => {
      localStorage.setItem('authToken', 'jwt-token-001');
      mockApiClient.post.mockResolvedValueOnce({ data: {} });

      await authApi.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(mockSentry.setUser).toHaveBeenCalledWith(null);
    });

    it('leaves the stored token in place when the request fails', async () => {
      localStorage.setItem('authToken', 'jwt-token-001');
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(authApi.logout()).rejects.toThrow('Network error');

      expect(localStorage.getItem('authToken')).toBe('jwt-token-001');
      expect(mockSentry.setUser).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('replaces the stored token with the refreshed one', async () => {
      localStorage.setItem('authToken', 'jwt-token-001');
      mockApiClient.post.mockResolvedValueOnce({ data: { data: { token: 'jwt-token-002' } } });

      await authApi.refresh();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh');
      expect(localStorage.getItem('authToken')).toBe('jwt-token-002');
    });

    it('keeps the existing token when the refresh fails', async () => {
      localStorage.setItem('authToken', 'jwt-token-001');
      mockApiClient.post.mockRejectedValueOnce(new Error('Refresh token expired'));

      await expect(authApi.refresh()).rejects.toThrow('Refresh token expired');

      expect(localStorage.getItem('authToken')).toBe('jwt-token-001');
    });
  });

  describe('forgotPassword', () => {
    it('posts the email to the forgot-password endpoint', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: {} });

      await authApi.forgotPassword({ email: 'jane@navin.io' });

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'jane@navin.io',
      });
    });

    it('propagates a rejected request', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Unknown email'));

      await expect(authApi.forgotPassword({ email: 'nobody@navin.io' })).rejects.toThrow(
        'Unknown email'
      );
    });
  });

  describe('resetPassword', () => {
    it('posts the reset token and new password', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: {} });

      await authApi.resetPassword({ token: 'reset-token', newPassword: 'new-secret' });

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        newPassword: 'new-secret',
      });
    });

    it('does not store an auth token on success', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: {} });

      await authApi.resetPassword({ token: 'reset-token', newPassword: 'new-secret' });

      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('propagates a rejected request', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Reset token expired'));

      await expect(
        authApi.resetPassword({ token: 'expired', newPassword: 'new-secret' })
      ).rejects.toThrow('Reset token expired');
    });
  });
});
