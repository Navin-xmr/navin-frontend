import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Signup from './Signup';

vi.mock('../../../services/api', () => ({
  authApi: {
    signup: vi.fn(),
  },
}));

vi.mock('../../../components/auth/WalletConnectButton/WalletConnectButton', () => ({
  WalletConnectButton: () => <button type="button">Connect Wallet</button>,
}));

import { authApi } from '../../../services/api';

const mockAuthApi = authApi as unknown as { signup: ReturnType<typeof vi.fn> };

const renderSignup = () =>
  render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  );

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Doe' } });
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
  fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
  fireEvent.click(screen.getByRole('checkbox'));
};

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the signup form', () => {
    renderSignup();

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty fields', async () => {
    renderSignup();

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('You must agree to the terms')).toBeInTheDocument();
    expect(mockAuthApi.signup).not.toHaveBeenCalled();
  });

  it('shows an error when passwords do not match', async () => {
    renderSignup();
    fillValidForm();
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(mockAuthApi.signup).not.toHaveBeenCalled();
  });

  it('signs up successfully and navigates to the dashboard', async () => {
    mockAuthApi.signup.mockResolvedValueOnce({});
    renderSignup();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockAuthApi.signup).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'password123',
        name: 'Jane Doe',
      });
    });
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('shows an error message when signup fails', async () => {
    mockAuthApi.signup.mockRejectedValueOnce(new Error('Signup failed'));
    renderSignup();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Account creation failed. Please try again.');
  });
});
