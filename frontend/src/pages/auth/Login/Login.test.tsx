import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import ProtectedRoute from '../../../components/auth/ProtectedRoute/ProtectedRoute';
import RoleGuard from '../../../components/auth/RoleGuard';
import { AuthProvider } from '../../../context/AuthContext';
import { setToken } from '../../../services/auth/tokenStorage';

vi.mock('../../../services/api', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

vi.mock('../../../context/WalletContext', () => ({
  useWallet: () => ({ disconnect: vi.fn() }),
}));

import { authApi } from '../../../services/api';

const mockAuthApi = authApi as unknown as { login: ReturnType<typeof vi.fn> };

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  );

function makeToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

// Mirrors the real route tree: /dashboard sits behind ProtectedRoute and a
// company-only RoleGuard, /dashboard/customer behind a customer-only one.
const renderGuardedApp = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleGuard allowedRoles={['company']} />}>
              <Route path="/dashboard" element={<div>Company Dashboard</div>} />
            </Route>
            <Route element={<RoleGuard allowedRoles={['customer']} />}>
              <Route path="/dashboard/customer" element={<div>Customer Dashboard</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

const submitCredentials = () => {
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the login form', () => {
    renderLogin();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty fields', async () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mockAuthApi.login).not.toHaveBeenCalled();
  });

  it('logs in successfully and navigates to the dashboard', async () => {
    mockAuthApi.login.mockResolvedValueOnce({});
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockAuthApi.login).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'password123' });
    });
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('shows an error message when login fails', async () => {
    mockAuthApi.login.mockRejectedValueOnce(new Error('Unauthorized'));
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password. Please try again.');
  });

  describe('auth state sync after login (#813)', () => {
    it('lands a company user on /dashboard without a page refresh', async () => {
      mockAuthApi.login.mockImplementationOnce(async () => {
        setToken(makeToken({ sub: 'user-1', role: 'company' }));
        return {};
      });
      renderGuardedApp();

      submitCredentials();

      expect(await screen.findByText('Company Dashboard')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument();
    });

    it('routes a customer user on to /dashboard/customer instead of back to /login', async () => {
      mockAuthApi.login.mockImplementationOnce(async () => {
        setToken(makeToken({ sub: 'user-2', role: 'customer' }));
        return {};
      });
      renderGuardedApp();

      submitCredentials();

      expect(await screen.findByText('Customer Dashboard')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument();
    });
  });
});
