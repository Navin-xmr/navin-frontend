import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import NotFoundPage from './NotFoundPage';

const { mockUseAuthContext } = vi.hoisted(() => ({ mockUseAuthContext: vi.fn() }));
vi.mock('../../context/AuthContext', () => ({ useAuthContext: mockUseAuthContext }));

describe('NotFoundPage', () => {
  it('renders the 404 message and links unauthenticated users home', () => {
    mockUseAuthContext.mockReturnValue({ isAuthenticated: false });
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go Home' })).toHaveAttribute('href', '/');
  });

  it('links authenticated users back to the dashboard', () => {
    mockUseAuthContext.mockReturnValue({ isAuthenticated: true });
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute('href', '/dashboard');
  });
});
