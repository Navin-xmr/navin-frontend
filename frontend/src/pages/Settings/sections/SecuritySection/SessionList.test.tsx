import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionList from './SessionList';

vi.mock('@services/api/client', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '@services/api/client';

const mockedGet = vi.mocked(apiClient.get);
const mockedDelete = vi.mocked(apiClient.delete);

interface Session {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  current?: boolean;
}

const sessions: Session[] = [
  {
    id: 'sess-1',
    device: 'Chrome on macOS',
    ip: '192.168.1.10',
    lastActive: '2026-10-14T10:00:00Z',
    current: true,
  },
  {
    id: 'sess-2',
    device: 'Firefox on Windows',
    ip: '10.0.0.5',
    lastActive: '2026-10-13T08:30:00Z',
  },
];

describe('SessionList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the loading state initially', () => {
    mockedGet.mockReturnValue(new Promise(() => {}));

    render(<SessionList />);

    expect(screen.getByText('Loading sessions…')).toBeInTheDocument();
  });

  it('renders sessions with device, ip and lastActive', async () => {
    mockedGet.mockResolvedValue({ data: sessions });

    render(<SessionList />);

    expect(await screen.findByText('Chrome on macOS')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.10')).toBeInTheDocument();
    expect(screen.getByText('Firefox on Windows')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.5')).toBeInTheDocument();
    expect(screen.getByText(/2026-10-14/)).toBeInTheDocument();
    expect(screen.getByText(/2026-10-13/)).toBeInTheDocument();
  });

  it('marks the current session and hides its revoke button', async () => {
    mockedGet.mockResolvedValue({ data: sessions });

    render(<SessionList />);

    expect(await screen.findByText('(this session)')).toBeInTheDocument();

    const revokeButtons = screen.getAllByRole('button', { name: /revoke/i });
    expect(revokeButtons).toHaveLength(1);
  });

  it('shows the empty state when the API returns an empty list', async () => {
    mockedGet.mockResolvedValue({ data: [] });

    render(<SessionList />);

    expect(await screen.findByText('No active sessions found.')).toBeInTheDocument();
  });

  it('shows the empty state when the API rejects', async () => {
    mockedGet.mockRejectedValue(new Error('network error'));

    render(<SessionList />);

    expect(await screen.findByText('No active sessions found.')).toBeInTheDocument();
  });

  it('revokes a non-current session and removes it from the list', async () => {
    const user = userEvent.setup();
    mockedGet.mockResolvedValue({ data: sessions });
    mockedDelete.mockResolvedValue({ data: {} });

    render(<SessionList />);

    expect(await screen.findByText('Firefox on Windows')).toBeInTheDocument();

    const revokeButton = screen.getByRole('button', { name: /revoke/i });
    await user.click(revokeButton);

    expect(mockedDelete).toHaveBeenCalledWith('/auth/sessions/sess-2');

    await waitFor(() => {
      expect(screen.queryByText('Firefox on Windows')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Chrome on macOS')).toBeInTheDocument();
  });

  it('disables the revoke button while the request is in flight', async () => {
    const user = userEvent.setup();
    mockedGet.mockResolvedValue({ data: sessions });

    let resolveDelete: (value: unknown) => void = () => {};
    mockedDelete.mockReturnValue(
      new Promise((resolve) => {
        resolveDelete = resolve;
      }),
    );

    render(<SessionList />);

    expect(await screen.findByText('Firefox on Windows')).toBeInTheDocument();

    const revokeButton = screen.getByRole('button', { name: /revoke/i });
    await user.click(revokeButton);

    expect(revokeButton).toBeDisabled();

    resolveDelete({ data: {} });

    await waitFor(() => {
      expect(screen.queryByText('Firefox on Windows')).not.toBeInTheDocument();
    });
  });
});