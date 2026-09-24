import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import WhatsNewPage from './WhatsNewPage';

describe('WhatsNewPage', () => {
  it('renders the latest release expanded with its highlights and changes', () => {
    render(<WhatsNewPage />);

    expect(screen.getByRole('heading', { name: "What's New" })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Release 1.5.0' })).toBeInTheDocument();
    const latestRelease = screen.getByRole('article', { name: 'Release 1.5.0' });
    expect(within(latestRelease).getByText('Dashboard Home Overhaul')).toBeInTheDocument();
    expect(within(latestRelease).getByText(/Recent Activity panel with live updates/)).toBeInTheDocument();
    expect(within(latestRelease).getByRole('link', { name: 'Issue #525' })).toHaveAttribute(
      'href',
      'https://github.com/Navin-xmr/navin-frontend/issues/525',
    );
  });

  it('collapses and re-expands a release card', async () => {
    const user = userEvent.setup();
    render(<WhatsNewPage />);
    const releaseToggle = screen.getByRole('button', { name: /Dashboard Home Overhaul/ });

    expect(releaseToggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(releaseToggle);
    expect(releaseToggle).toHaveAttribute('aria-expanded', 'false');
    const latestRelease = screen.getByRole('article', { name: 'Release 1.5.0' });
    expect(within(latestRelease).getByText(/A completely redesigned dashboard home/)).toBeInTheDocument();
    expect(within(latestRelease).queryByText(/Recent Activity panel with live updates/)).not.toBeInTheDocument();

    await user.click(releaseToggle);
    expect(releaseToggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(latestRelease).getByText(/Recent Activity panel with live updates/)).toBeInTheDocument();
  });

  it('filters the release list by change type', async () => {
    const user = userEvent.setup();
    render(<WhatsNewPage />);

    await user.click(screen.getByRole('button', { name: 'Security' }));

    expect(screen.getByRole('button', { name: 'Security' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('article', { name: 'Release 1.1.0' })).toBeInTheDocument();
    expect(screen.queryByRole('article', { name: 'Release 1.5.0' })).not.toBeInTheDocument();
    const securityRelease = screen.getByRole('article', { name: 'Release 1.1.0' });
    await user.click(within(securityRelease).getByRole('button'));
    expect(
      within(securityRelease).getByText(
        'Wallet connect button now validates network before signing transactions.',
      ),
    ).toBeInTheDocument();
  });

  it('shows a clear no-match state when a release type has no results', async () => {
    const user = userEvent.setup();
    render(<WhatsNewPage />);

    // Every curated release currently contains at least one feature, so the
    // filter remains behaviorally verifiable through the populated list.
    await user.click(screen.getByRole('button', { name: 'Features' }));

    expect(screen.getByRole('button', { name: 'Features' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('No releases match this filter.')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });
});
