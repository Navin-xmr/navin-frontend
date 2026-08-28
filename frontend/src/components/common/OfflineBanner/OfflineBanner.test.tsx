import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import OfflineBanner from './OfflineBanner';

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
  },
}));

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
}

describe('OfflineBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setOnline(true);
  });

  afterEach(() => {
    setOnline(true);
  });

  it('renders nothing while online', () => {
    render(<OfflineBanner />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the banner when the browser starts out offline', () => {
    setOnline(false);
    render(<OfflineBanner />);

    expect(screen.getByRole('alert')).toHaveTextContent(/you are offline/i);
  });

  it('shows the banner when an offline event fires', () => {
    render(<OfflineBanner />);

    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('hides the banner and announces reconnection after being offline', () => {
    render(<OfflineBanner />);

    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("You're back online.", { id: 'connection-restored' });
  });

  it('does not announce reconnection on initial mount', () => {
    render(<OfflineBanner />);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('dismisses the banner without requiring the browser to go online', () => {
    setOnline(false);
    render(<OfflineBanner />);

    fireEvent.click(screen.getByRole('button', { name: /dismiss offline banner/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('re-arms after dismissal once a new offline event occurs', () => {
    setOnline(false);
    render(<OfflineBanner />);

    fireEvent.click(screen.getByRole('button', { name: /dismiss offline banner/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });
    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
