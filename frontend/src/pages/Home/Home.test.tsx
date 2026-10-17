import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Home from './Home';

vi.mock('@hooks/useReturningVisitor', () => ({
  useReturningVisitor: () => ({ isReturning: false, visitCount: 0, lastVisit: null, daysSinceLastVisit: 0 }),
}));
vi.mock('@context/AuthContext', () => ({
  useAuthContext: () => ({ isAuthenticated: false }),
}));

describe('Home landing page', () => {
  it('renders primary landing CTA and Navbar routes', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>,
    );
    const trackingLinks = screen.getAllByRole('link', { name: 'Track Your Shipment' });
    expect(trackingLinks).toHaveLength(2);
    expect(trackingLinks.every((link) => link.getAttribute('href') === '#track')).toBe(true);
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Free Demo' })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: 'Navin LogoNavin' })).toHaveAttribute('href', '/');
  });
});
