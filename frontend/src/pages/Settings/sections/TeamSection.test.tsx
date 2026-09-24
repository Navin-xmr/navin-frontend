import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mock API endpoints ───────────────────────────────────────────────────────

const { mockUsersGetAll, mockUsersInvite, mockUsersUpdateRole, mockUsersDeactivate, mockUsersActivate, mockInvitationsList, mockInvitationsResend } =
  vi.hoisted(() => ({
    mockUsersGetAll: vi.fn(),
    mockUsersInvite: vi.fn(),
    mockUsersUpdateRole: vi.fn(),
    mockUsersDeactivate: vi.fn(),
    mockUsersActivate: vi.fn(),
    mockInvitationsList: vi.fn(),
    mockInvitationsResend: vi.fn(),
  }));

vi.mock('@services/api/endpoints/users', () => ({
  usersApi: {
    getAll: mockUsersGetAll,
    invite: mockUsersInvite,
    updateRole: mockUsersUpdateRole,
    deactivate: mockUsersDeactivate,
    activate: mockUsersActivate,
  },
  invitationsApi: {
    list: mockInvitationsList,
    resend: mockInvitationsResend,
  },
}));

import TeamSection from './TeamSection';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ACTIVE_USER = {
  _id: 'u1',
  name: 'Alice Admin',
  email: 'alice@example.com',
  role: 'Admin' as const,
  status: 'Active' as const,
  lastLogin: '2024-01-10T08:00:00Z',
};

const DEACTIVATED_USER = {
  _id: 'u2',
  name: 'Bob Viewer',
  email: 'bob@example.com',
  role: 'Viewer' as const,
  status: 'Inactive' as const,
  lastLogin: '2024-01-01T00:00:00Z',
};

const PENDING_INVITATION = {
  _id: 'inv1',
  email: 'carol@example.com',
  role: 'Manager' as const,
  status: 'pending' as const,
  createdAt: '2024-01-09T00:00:00Z',
  expiresAt: '2024-01-16T00:00:00Z',
};

function setupDefaultMocks() {
  mockUsersGetAll.mockResolvedValue({ data: [ACTIVE_USER, DEACTIVATED_USER], page: 1, limit: 100, total: 2 });
  mockInvitationsList.mockResolvedValue([PENDING_INVITATION]);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TeamSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
  });

  // ── Initial render ────────────────────────────────────────────────────────

  it('shows a loading indicator then renders team members', async () => {
    render(<TeamSection />);
    expect(screen.getByText(/loading team members/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument());
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Viewer')).toBeInTheDocument();
  });

  it('renders pending invitation members', async () => {
    render(<TeamSection />);
    await waitFor(() => expect(screen.getByText('carol@example.com')).toBeInTheDocument());
    // Invitation members show the Invited status badge (may also appear as a filter option)
    expect(screen.getAllByText('Invited').length).toBeGreaterThan(0);
  });

  it('shows empty state when API returns no members and no invitations', async () => {
    mockUsersGetAll.mockResolvedValue({ data: [], page: 1, limit: 100, total: 0 });
    mockInvitationsList.mockResolvedValue([]);

    render(<TeamSection />);
    await waitFor(() =>
      expect(screen.getByText(/no team members yet/i)).toBeInTheDocument(),
    );
  });

  it('shows filter empty state when no members match', async () => {
    render(<TeamSection />);
    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument());

    // Filter by Driver — nobody has that role
    const roleSelect = screen.getByDisplayValue('All Roles');
    await userEvent.selectOptions(roleSelect, 'Driver');

    await waitFor(() =>
      expect(screen.getByText(/no members match the selected filters/i)).toBeInTheDocument(),
    );
  });

  // ── Invite modal ──────────────────────────────────────────────────────────

  it('opens the invite modal when "Invite Member" is clicked', async () => {
    render(<TeamSection />);
    await userEvent.click(screen.getByRole('button', { name: /invite member/i }));
    expect(screen.getByText('Invite Team Member')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/colleague@company\.com/i)).toBeInTheDocument();
  });

  it('shows validation error for an invalid email', async () => {
    render(<TeamSection />);
    await userEvent.click(screen.getByRole('button', { name: /invite member/i }));
    await userEvent.type(screen.getByPlaceholderText(/colleague@company\.com/i), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(mockUsersInvite).not.toHaveBeenCalled();
  });

  it('calls usersApi.invite and closes the modal on success', async () => {
    mockUsersInvite.mockResolvedValue({});
    mockInvitationsList.mockResolvedValue([]);

    render(<TeamSection />);
    await waitFor(() => screen.getByText('Alice Admin'));

    await userEvent.click(screen.getByRole('button', { name: /invite member/i }));
    await waitFor(() => screen.getByText('Invite Team Member'));

    // Use fireEvent.change to directly set the controlled input value
    const emailInput = screen.getByPlaceholderText(/colleague@company\.com/i);
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() =>
      expect(mockUsersInvite).toHaveBeenCalledWith({
        email: 'new@example.com',
        role: 'Viewer',
      }),
      { timeout: 5000 },
    );
    await waitFor(() =>
      expect(screen.queryByText('Invite Team Member')).not.toBeInTheDocument(),
    );
  });

  it('shows an error message when the invite API call fails', async () => {
    mockUsersInvite.mockRejectedValue(new Error('Server error'));

    render(<TeamSection />);
    await waitFor(() => screen.getByText('Alice Admin'));

    await userEvent.click(screen.getByRole('button', { name: /invite member/i }));
    await waitFor(() => screen.getByText('Invite Team Member'));

    const emailInput = screen.getByPlaceholderText(/colleague@company\.com/i);
    fireEvent.change(emailInput, { target: { value: 'fail@example.com' } });

    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() =>
      expect(screen.getByText(/server error/i)).toBeInTheDocument(),
      { timeout: 5000 },
    );
  });

  // ── Deactivate / activate flow ────────────────────────────────────────────

  it('opens confirmation dialog and calls deactivate on an active user', async () => {
    mockUsersDeactivate.mockResolvedValue({});
    render(<TeamSection />);
    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument());

    // Click the row Deactivate button
    await userEvent.click(screen.getByRole('button', { name: /deactivate/i }));

    // Confirmation dialog appears
    expect(screen.getByText(/deactivate alice admin\?/i)).toBeInTheDocument();

    // The confirm button is last in the DOM — get all and click the last one
    const deactivateBtns = screen.getAllByRole('button', { name: /deactivate/i });
    await userEvent.click(deactivateBtns[deactivateBtns.length - 1]);

    await waitFor(() => expect(mockUsersDeactivate).toHaveBeenCalledWith('u1'));
  });

  it('opens confirmation dialog and calls activate on a deactivated user', async () => {
    mockUsersActivate.mockResolvedValue({});
    render(<TeamSection />);
    await waitFor(() => expect(screen.getByText('Bob Viewer')).toBeInTheDocument());

    // Click the Reactivate row button
    await userEvent.click(screen.getByRole('button', { name: /reactivate/i }));

    const dialog = screen.getByText(/reactivate bob viewer\?/i);
    expect(dialog).toBeInTheDocument();

    // Confirm button is inside the modal footer — it contains "Reactivate" text
    const confirmBtns = screen.getAllByRole('button', { name: /reactivate/i });
    // Last one is the confirm button in the modal
    await userEvent.click(confirmBtns[confirmBtns.length - 1]);

    await waitFor(() => expect(mockUsersActivate).toHaveBeenCalledWith('u2'));
  });

  it('cancels the confirmation dialog without calling the API', async () => {
    render(<TeamSection />);
    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /deactivate/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockUsersDeactivate).not.toHaveBeenCalled();
  });

  // ── Resend invitation ─────────────────────────────────────────────────────

  it('shows confirmation dialog and calls resend for a pending invitation', async () => {
    mockInvitationsResend.mockResolvedValue({});
    render(<TeamSection />);
    await waitFor(() => expect(screen.getByText('carol@example.com')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /resend/i }));

    expect(screen.getByText(/resend invitation to carol@example\.com\?/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /resend invitation/i }));

    await waitFor(() => expect(mockInvitationsResend).toHaveBeenCalledWith('inv1'));
  });

  // ── Role filter ───────────────────────────────────────────────────────────

  it('filters members by role', async () => {
    render(<TeamSection />);
    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument());

    const roleSelect = screen.getByDisplayValue('All Roles');
    await userEvent.selectOptions(roleSelect, 'Admin');

    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    expect(screen.queryByText('Bob Viewer')).not.toBeInTheDocument();
  });

  // ── API error ─────────────────────────────────────────────────────────────

  it('renders an empty list (no crash) when the API rejects', async () => {
    mockUsersGetAll.mockRejectedValue(new Error('Network error'));
    mockInvitationsList.mockResolvedValue([]);

    render(<TeamSection />);

    await waitFor(() =>
      expect(screen.queryByText(/loading team members/i)).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/no team members yet/i)).toBeInTheDocument();
  });
});
