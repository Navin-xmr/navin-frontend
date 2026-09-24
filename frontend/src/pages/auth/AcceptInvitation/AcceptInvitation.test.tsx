import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AcceptInvitation from './AcceptInvitation';

vi.mock('@services/api', () => ({
  invitationsApi: {
    getInfo: vi.fn(),
    accept: vi.fn(),
  },
}));

import { invitationsApi } from '@services/api';

const mockInvitationsApi = invitationsApi as unknown as {
  getInfo: ReturnType<typeof vi.fn>;
  accept: ReturnType<typeof vi.fn>;
};

const inviteInfo = { companyName: 'Acme Inc', role: 'Viewer' as const, email: 'new@example.com' };

const renderPage = (initialEntry = '/accept-invitation?token=tok-1') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/accept-invitation" element={<AcceptInvitation />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('AcceptInvitation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows invite details once the invitation info loads', async () => {
    mockInvitationsApi.getInfo.mockResolvedValueOnce(inviteInfo);
    renderPage();

    expect(await screen.findByText(/you're invited!/i)).toBeInTheDocument();
    expect(mockInvitationsApi.getInfo).toHaveBeenCalledWith('tok-1');
    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
  });

  it('shows an error state when the token is missing', async () => {
    renderPage('/accept-invitation');

    expect(await screen.findByText(/invalid invitation/i)).toBeInTheDocument();
    expect(mockInvitationsApi.getInfo).not.toHaveBeenCalled();
  });

  it('shows an error state when the invitation lookup fails', async () => {
    mockInvitationsApi.getInfo.mockRejectedValueOnce(new Error('expired'));
    renderPage();

    expect(await screen.findByText(/invalid invitation/i)).toBeInTheDocument();
    expect(screen.getByText(/link is invalid or has expired/i)).toBeInTheDocument();
  });

  it('accepts the invitation and shows the success screen', async () => {
    mockInvitationsApi.getInfo.mockResolvedValueOnce(inviteInfo);
    mockInvitationsApi.accept.mockResolvedValueOnce({ token: 'auth-token-123' });
    renderPage();

    await screen.findByText(/you're invited!/i);

    fireEvent.change(screen.getByPlaceholderText(/your full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/at least 8 characters/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/repeat your password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account & join/i }));

    await waitFor(() => {
      expect(mockInvitationsApi.accept).toHaveBeenCalledWith({
        token: 'tok-1',
        password: 'password123',
        name: 'Jane Doe',
      });
    });
    expect(await screen.findByText(/welcome to navin!/i)).toBeInTheDocument();
    expect(localStorage.getItem('authToken')).toBe('auth-token-123');
  });

  it('shows a submit error when accepting the invitation fails', async () => {
    mockInvitationsApi.getInfo.mockResolvedValueOnce(inviteInfo);
    mockInvitationsApi.accept.mockRejectedValueOnce(new Error('expired token'));
    renderPage();

    await screen.findByText(/you're invited!/i);

    fireEvent.change(screen.getByPlaceholderText(/your full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/at least 8 characters/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/repeat your password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account & join/i }));

    expect(await screen.findByText(/token may have expired/i)).toBeInTheDocument();
  });
});
