import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';

vi.mock('../../../services/api', () => ({
  authApi: {
    login: vi.fn(),
  },
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

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
