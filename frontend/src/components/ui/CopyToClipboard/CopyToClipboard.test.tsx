import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CopyToClipboard } from './CopyToClipboard';
import { ToastProvider } from '../../../context/ToastContext';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ToastProvider>{ui}</ToastProvider>);
};

describe('CopyToClipboard', () => {
  let writeTextMock: ReturnType<typeof vi.fn>;
  let execCommandMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    execCommandMock = vi.fn().mockReturnValue(false);
    Object.defineProperty(document, 'execCommand', {
      value: execCommandMock,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('calls writeText with the provided value when clicked', async () => {
    renderWithProvider(<CopyToClipboard value="hello world" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('hello world');
    });
  });

  it('shows the Check icon with aria-label "Copied to clipboard" and a success toast on success', async () => {
    renderWithProvider(<CopyToClipboard value="copy me" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByLabelText('Copied to clipboard')
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/copied/i)).toBeInTheDocument();
  });

  it('shows the error toast "Failed to copy to clipboard" when writeText rejects', async () => {
    writeTextMock.mockRejectedValueOnce(new Error('nope'));
    execCommandMock.mockReturnValue(false);

    renderWithProvider(<CopyToClipboard value="fail me" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to copy to clipboard')
      ).toBeInTheDocument();
    });
  });

  it('disables the button when value is empty', () => {
    renderWithProvider(<CopyToClipboard value="" />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders the label prop and switches to "Copied" after a successful copy', async () => {
    renderWithProvider(<CopyToClipboard value="labeled" label="Copy" />);

    expect(screen.getByText('Copy')).toBeInTheDocument();

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeInTheDocument();
    });
  });

  it('resets the copied state after successDuration', async () => {
    vi.useFakeTimers();

    renderWithProvider(
      <CopyToClipboard value="timed" label="Copy" successDuration={2000} />
    );

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Copied')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Copy')).toBeInTheDocument();
  });
});