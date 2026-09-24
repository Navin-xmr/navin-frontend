import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SlowConnectionBanner from './SlowConnectionBanner';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { useSlowConnection } from '../../../hooks/useSlowConnection';

vi.mock('../../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(),
}));
vi.mock('../../../hooks/useSlowConnection', () => ({
  useSlowConnection: vi.fn(),
}));

const mockedUseOnlineStatus = vi.mocked(useOnlineStatus);
const mockedUseSlowConnection = vi.mocked(useSlowConnection);

describe('SlowConnectionBanner', () => {
  beforeEach(() => {
    mockedUseOnlineStatus.mockReset();
    mockedUseSlowConnection.mockReset();
  });

  it('renders nothing when online and the connection is not slow', () => {
    mockedUseOnlineStatus.mockReturnValue(true);
    mockedUseSlowConnection.mockReturnValue(false);

    render(<SlowConnectionBanner />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders nothing when offline, even if the connection is slow', () => {
    mockedUseOnlineStatus.mockReturnValue(false);
    mockedUseSlowConnection.mockReturnValue(true);

    render(<SlowConnectionBanner />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the banner when online and the connection is slow', () => {
    mockedUseOnlineStatus.mockReturnValue(true);
    mockedUseSlowConnection.mockReturnValue(true);

    render(<SlowConnectionBanner />);

    expect(screen.getByRole('status')).toHaveTextContent(/connection appears slow/i);
  });

  it('dismisses the banner when the dismiss button is clicked', () => {
    mockedUseOnlineStatus.mockReturnValue(true);
    mockedUseSlowConnection.mockReturnValue(true);

    render(<SlowConnectionBanner />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss slow connection banner/i }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('re-arms a dismissed banner when the browser reports a fresh slow spell', () => {
    mockedUseOnlineStatus.mockReturnValue(true);
    let capturedOnChange: ((slow: boolean) => void) | undefined;
    mockedUseSlowConnection.mockImplementation((onChange) => {
      capturedOnChange = onChange;
      return true;
    });

    render(<SlowConnectionBanner />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss slow connection banner/i }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    act(() => {
      capturedOnChange?.(true);
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not re-arm a dismissed banner when the browser reports the connection is no longer slow', () => {
    mockedUseOnlineStatus.mockReturnValue(true);
    let capturedOnChange: ((slow: boolean) => void) | undefined;
    mockedUseSlowConnection.mockImplementation((onChange) => {
      capturedOnChange = onChange;
      return true;
    });

    render(<SlowConnectionBanner />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss slow connection banner/i }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    act(() => {
      capturedOnChange?.(false);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
