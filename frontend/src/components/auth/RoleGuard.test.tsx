import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RoleGuard from './RoleGuard';
import { AuthProvider } from '../../context/AuthContext';

// Helper to create a valid-looking JWT (not cryptographically signed, just for testing)
function makeToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function renderWithAuth(token: string | null, path: string) {
  if (token) localStorage.setItem('authToken', token);
  else localStorage.removeItem('authToken');

  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route
            element={<RoleGuard allowedRoles={['company']} />}
          >
            <Route path="/company" element={<div>Company Page</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('RoleGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading while checking auth', () => {
    renderWithAuth(makeToken({ role: 'company', sub: '1' }), '/company');
    expect(screen.getByText('Checking permissions…')).toBeInTheDocument();
  });

  it('renders protected content for matching role', () => {
    renderWithAuth(makeToken({ role: 'company', sub: '1' }), '/company');
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByText('Company Page')).toBeInTheDocument();
  });

  it('redirects to dashboard when role does not match', () => {
    renderWithAuth(makeToken({ role: 'customer', sub: '2' }), '/company');
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Company Page')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login', () => {
    renderWithAuth(null, '/company');
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
