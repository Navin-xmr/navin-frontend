import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PWAInstallPrompt from './PWAInstallPrompt';

const DISMISS_KEY = 'navin-pwa-prompt-dismissed';
const DAY_MS = 24 * 60 * 60 * 1000;

interface FakePromptEvent extends Event {
  prompt: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function firePrompt(outcome: 'accepted' | 'dismissed' = 'accepted'): FakePromptEvent {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as FakePromptEvent;
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe('PWAInstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders nothing until an install prompt event fires', () => {
    render(<PWAInstallPrompt />);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('shows the prompt when beforeinstallprompt fires', async () => {
    render(<PWAInstallPrompt />);
    firePrompt();

    expect(await screen.findByText(/Install Navin on your device for offline access/i)).toBeInTheDocument();
  });

  it('stays hidden if dismissed within the last 7 days', () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() - 1 * DAY_MS));
    render(<PWAInstallPrompt />);
    firePrompt();

    expect(screen.queryByText(/Install Navin on your device for offline access/i)).not.toBeInTheDocument();
  });

  it('shows again once a prior dismissal has expired', async () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() - 8 * DAY_MS));
    render(<PWAInstallPrompt />);
    firePrompt();

    expect(await screen.findByText(/Install Navin on your device for offline access/i)).toBeInTheDocument();
  });

  it('hides and persists dismissal when the dismiss button is clicked', async () => {
    render(<PWAInstallPrompt />);
    firePrompt();
    await screen.findByText(/Install Navin on your device for offline access/i);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss install prompt' }));

    expect(screen.queryByText(/Install Navin on your device for offline access/i)).not.toBeInTheDocument();
    expect(localStorage.getItem(DISMISS_KEY)).not.toBeNull();
  });

  it('installs and hides the prompt when the user accepts', async () => {
    render(<PWAInstallPrompt />);
    const event = firePrompt('accepted');
    await screen.findByText(/Install Navin on your device for offline access/i);

    fireEvent.click(screen.getByRole('button', { name: 'Install' }));

    await waitFor(() => expect(event.prompt).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.queryByText(/Install Navin on your device for offline access/i)).not.toBeInTheDocument()
    );
  });

  it('keeps the prompt visible but stops re-prompting when the user declines', async () => {
    render(<PWAInstallPrompt />);
    const event = firePrompt('dismissed');
    await screen.findByText(/Install Navin on your device for offline access/i);

    fireEvent.click(screen.getByRole('button', { name: 'Install' }));
    await waitFor(() => expect(event.prompt).toHaveBeenCalledTimes(1));

    expect(screen.getByText(/Install Navin on your device for offline access/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Install' }));
    expect(event.prompt).toHaveBeenCalledTimes(1);
  });
});
