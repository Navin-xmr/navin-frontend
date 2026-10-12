import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from '../RoleGuard';
import { AuthProvider } from '../../../context/AuthContext';

vi.mock('../../../context/WalletContext', () => ({
  useWallet: () => ({ disconnect: vi.fn() }),
}));

// Helper to create a valid-looking JWT (not cryptographically signed, just for testing)
function makeToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function renderRoutes() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleGuard allowedRoles={['company']} />}>
              <Route path="/dashboard" element={<div>Protected Dashboard</div>} />
            </Route>
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading state while checking auth status', () => {
    renderRoutes();

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login', () => {
    renderRoutes();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
  });

  it('renders protected content for authenticated users', () => {
    localStorage.setItem('authToken', makeToken({ sub: 'user-1', role: 'company' }));

    renderRoutes();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

});
