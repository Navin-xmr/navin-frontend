import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SessionTimeoutModal from './SessionTimeoutModal';

describe('SessionTimeoutModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the countdown starting from the provided seconds', () => {
    render(
      <SessionTimeoutModal
        isOpen
        secondsRemaining={60}
        onExtend={vi.fn()}
        onLogout={vi.fn()}
      />
    );

    expect(screen.getByText(/60/)).toBeInTheDocument();
  });

  it('decrements the countdown as time passes', () => {
    render(
      <SessionTimeoutModal
        isOpen
        secondsRemaining={60}
        onExtend={vi.fn()}
        onLogout={vi.fn()}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/59/)).toBeInTheDocument();
  });

  it('calls onExtend when the extend-session action is clicked', () => {
    const onExtend = vi.fn();

    render(
      <SessionTimeoutModal
        isOpen
        secondsRemaining={60}
        onExtend={onExtend}
        onLogout={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /extend/i }));

    expect(onExtend).toHaveBeenCalledTimes(1);
  });

  it('calls onLogout when the logout action is clicked', () => {
    const onLogout = vi.fn();

    render(
      <SessionTimeoutModal
        isOpen
        secondsRemaining={60}
        onExtend={vi.fn()}
        onLogout={onLogout}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /log ?out/i }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
