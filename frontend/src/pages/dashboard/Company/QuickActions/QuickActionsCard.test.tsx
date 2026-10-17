import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { QuickActionsCard } from './QuickActionsCard';

const actions = [
  { label: 'Create Shipment', route: '/dashboard/shipments/create', key: 'n' },
  { label: 'View Anomalies', route: '/dashboard/anomalies', key: 'a' },
  { label: 'Open Settlements', route: '/dashboard/settlements', key: 's' },
  { label: 'Blockchain Ledger', route: '/dashboard/blockchain-ledger', key: 'b' },
  { label: 'Export Shipments', route: '/dashboard/export', key: 'e' },
  { label: 'Analytics', route: '/dashboard/analytics', key: 'l' },
];

function CurrentLocation() {
  const { pathname } = useLocation();
  return <output data-testid="current-location">{pathname}</output>;
}

function renderCard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <QuickActionsCard />
      <input aria-label="Search shipments" />
      <CurrentLocation />
    </MemoryRouter>,
  );
}

describe('QuickActionsCard', () => {
  // This widget has a fixed action list and no loading or empty-data states.
  it('renders all six actions immediately with their destinations and shortcuts', () => {
    renderCard();

    expect(screen.getByRole('heading', { name: 'Quick Actions' })).toBeInTheDocument();
    expect(screen.getByText('keyboard shortcuts enabled')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(actions.length);
    for (const { label, route, key } of actions) {
      const link = screen.getByRole('link', { name: `${label} Alt+${key.toUpperCase()}` });
      expect(link).toHaveAttribute('href', route);
      expect(screen.getByText(`Alt+${key.toUpperCase()}`).tagName).toBe('KBD');
    }
  });

  it.each(actions)('navigates to $route when the $label action is clicked', async ({ label, route }) => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole('link', { name: new RegExp(`^${label}`) }));

    expect(screen.getByTestId('current-location').textContent).toBe(route);
  });

  it.each(actions)('navigates to $route with Alt+$key', ({ route, key }) => {
    renderCard();

    fireEvent.keyDown(document.body, { key, altKey: true });

    expect(screen.getByTestId('current-location').textContent).toBe(route);
  });

  it('ignores shortcut keys without Alt or with an extra modifier', () => {
    renderCard();

    fireEvent.keyDown(document.body, { key: 'n' });
    fireEvent.keyDown(document.body, { key: 'n', altKey: true, ctrlKey: true });

    expect(screen.getByTestId('current-location').textContent).toBe('/dashboard');
  });

  it('does not navigate while the user is typing in an input', () => {
    renderCard();

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search shipments' }), {
      key: 'n',
      altKey: true,
    });

    expect(screen.getByTestId('current-location').textContent).toBe('/dashboard');
  });
});
