import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HelpCenter from './HelpCenter';

const navigate = vi.hoisted(() => vi.fn());
const addToast = vi.hoisted(() => vi.fn());
const resetTourFlag = vi.hoisted(() => vi.fn());
const resetChecklist = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

vi.mock('@context/ToastContext', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('@components/onboarding/OnboardingTour', () => ({ resetTourFlag }));
vi.mock('@components/onboarding/OnboardingChecklist', () => ({ resetChecklist }));

describe('HelpCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders common tasks and filters them by search keyword', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HelpCenter />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Help Center' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create a shipment/i })).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Search common tasks' }), 'wallet');

    expect(screen.getByRole('button', { name: /Connect a wallet/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Create a shipment/i })).not.toBeInTheDocument();
  });

  it('shows a no-match state and clears the search', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HelpCenter />
      </MemoryRouter>,
    );
    const search = screen.getByRole('searchbox', { name: 'Search common tasks' });

    await user.type(search, 'does-not-exist');
    expect(screen.getByText('No matching tasks')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(screen.getByRole('button', { name: /Create a shipment/i })).toBeInTheDocument();
  });

  it('navigates from a common task and a quick link', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HelpCenter />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /Track a shipment/i }));
    expect(navigate).toHaveBeenCalledWith('/dashboard/shipments');

    await user.click(screen.getByRole('button', { name: /Blockchain Ledger/i }));
    expect(navigate).toHaveBeenCalledWith('/dashboard/blockchain-ledger');
  });

  it('expands an FAQ answer and restores the setup checklist with a toast', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HelpCenter />
      </MemoryRouter>,
    );

    const faq = screen.getByRole('button', { name: 'How do I create a new shipment?' });
    expect(faq).toHaveAttribute('aria-expanded', 'false');
    await user.click(faq);
    expect(faq).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Go to Shipments and select "New Shipment"/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Restore Setup Checklist' }));
    expect(resetChecklist).toHaveBeenCalledTimes(1);
    expect(addToast).toHaveBeenCalledWith('Setup checklist restored on your dashboard.', 'success');
  });
});
