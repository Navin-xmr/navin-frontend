import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProfileDispatcher from './ProfileDispatcher';
import * as AuthContextModule from '@context/AuthContext';
import type { AuthContextValue } from '@context/AuthContext';
import type { UserRole } from '@utils/rbac';

vi.mock('@context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('@pages/dashboard/Customer/Profile/CustomerProfile', () => ({
  default: () => <div>Customer Delivery Address Form</div>,
}));

function authAs(role: UserRole, userId: string): AuthContextValue {
  return {
    role,
    userId,
    isAuthenticated: true,
    isLoading: false,
    refresh: vi.fn(),
    logout: vi.fn(),
  };
}

describe('ProfileDispatcher', () => {
  it('redirects company user to /dashboard/settings?tab=profile and does not show customer form', () => {
    vi.spyOn(AuthContextModule, 'useAuthContext').mockReturnValue(authAs('company', '1'));

    render(
      <MemoryRouter initialEntries={['/dashboard/profile']}>
        <Routes>
          <Route path="/dashboard/profile" element={<ProfileDispatcher />} />
          <Route path="/dashboard/settings" element={<div>Company Settings Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Customer Delivery Address Form')).not.toBeInTheDocument();
    expect(screen.getByText('Company Settings Page')).toBeInTheDocument();
  });

  it('renders customer profile form for customer users', () => {
    vi.spyOn(AuthContextModule, 'useAuthContext').mockReturnValue(authAs('customer', '2'));

    render(
      <MemoryRouter initialEntries={['/dashboard/profile']}>
        <Routes>
          <Route path="/dashboard/profile" element={<ProfileDispatcher />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Customer Delivery Address Form')).toBeInTheDocument();
  });
});
