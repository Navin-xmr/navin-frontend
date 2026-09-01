import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mock API ─────────────────────────────────────────────────────────────────

const { mockGetAll, mockUpdateRole, mockDeactivate, mockActivate, mockInvSend, mockInvList, mockInvResend, mockInvRevoke } =
  vi.hoisted(() => ({
    mockGetAll: vi.fn(),
    mockUpdateRole: vi.fn(),
    mockDeactivate: vi.fn(),
    mockActivate: vi.fn(),
    mockInvSend: vi.fn(),
    mockInvList: vi.fn(),
    mockInvResend: vi.fn(),
    mockInvRevoke: vi.fn(),
  }));

vi.mock('@services/api', () => ({
  usersApi: {
    getAll: mockGetAll,
    updateRole: mockUpdateRole,
    deactivate: mockDeactivate,
    activate: mockActivate,
  },
  invitationsApi: {
    send: mockInvSend,
    list: mockInvList,
    resend: mockInvResend,
    revoke: mockInvRevoke,
  },
}));

// ─── Mock context / hooks ─────────────────────────────────────────────────────

const addToast = vi.fn();
vi.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('../../../../hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(),
}));

// ─── Mock child UI ────────────────────────────────────────────────────────────

vi.mock('../../../../components/ui/Avatar', () => ({
  default: ({ name }: { name: string }) => <span data-testid="avatar">{name[0]}</span>,
}));

vi.mock('@components/common/Breadcrumb', () => ({
  default: () => <nav aria-label="breadcrumb" />,
}));

import UserManagement from './UserManagement';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<{
  _id: string; name: string; email: string; role: 'Admin' | 'Manager' | 'Viewer'; status: 'Active' | 'Inactive'; lastLogin: string;
}> = {}) {
  return {
    _id: 'u1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    role: 'Admin' as const,
    status: 'Active' as const,
    lastLogin: '2024-01-10T08:00:00Z',
    ...overrides,
  };
}

const PENDING_INV = {
  _id: 'inv1',
  email: 'carol@example.com',
  role: 'Viewer' as const,
  status: 'pending' as const,
  createdAt: '2024-01-09T00:00:00Z',
  expiresAt: '2024-01-16T00:00:00Z',
};

function setupDefaultMocks() {
  mockGetAll.mockResolvedValue({ data: [makeUser()], page: 1, limit: 8, total: 1 });
  mockInvList.mockResolvedValue([PENDING_INV]);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
  });

  // ── Initial render ────────────────────────────────────────────────────────

  it('shows a loading spinner then renders the user table', async () => {
    render(<UserManagement />);
    expect(screen.getByText(/loading team members/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders the page heading', async () => {
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));
    expect(screen.getByRole('heading', { name: /team management/i })).toBeInTheDocument();
  });

  it('shows pending invitations section when invitations exist', async () => {
    render(<UserManagement />);
    await waitFor(() => expect(screen.getByText('carol@example.com')).toBeInTheDocument());
    expect(screen.getByText(/pending invitations/i)).toBeInTheDocument();
  });

  // ── Error state ───────────────────────────────────────────────────────────

  it('shows an error state when the API fails', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));
    mockInvList.mockResolvedValue([]);

    render(<UserManagement />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /failed to load users/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('retries the API call when the Retry button is clicked', async () => {
    mockGetAll
      .mockRejectedValueOnce(new Error('first fail'))
      .mockResolvedValue({ data: [makeUser()], page: 1, limit: 8, total: 1 });
    mockInvList.mockResolvedValue([]);

    render(<UserManagement />);
    await waitFor(() => screen.getByRole('button', { name: /retry/i }));

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
  });

  // ── Search / filter ───────────────────────────────────────────────────────

  it('filters users by name search', async () => {
    mockGetAll.mockResolvedValue({
      data: [makeUser(), makeUser({ _id: 'u2', name: 'Bob Jones', email: 'bob@example.com', role: 'Viewer' })],
      page: 1, limit: 8, total: 2,
    });
    mockInvList.mockResolvedValue([]);

    render(<UserManagement />);
    await waitFor(() => screen.getByText('Bob Jones'));

    await userEvent.type(screen.getByPlaceholderText(/search by name or email/i), 'Alice');

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
  });

  it('shows empty table row when search yields no results', async () => {
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    await userEvent.type(screen.getByPlaceholderText(/search by name or email/i), 'zzznobody');

    expect(screen.getByText(/no users found matching your criteria/i)).toBeInTheDocument();
  });

  it('filters users by role', async () => {
    mockGetAll.mockResolvedValue({
      data: [
        makeUser(),
        makeUser({ _id: 'u2', name: 'Bob Jones', email: 'bob@example.com', role: 'Viewer' }),
      ],
      page: 1, limit: 8, total: 2,
    });
    mockInvList.mockResolvedValue([]);

    render(<UserManagement />);
    await waitFor(() => screen.getByText('Bob Jones'));

    await userEvent.selectOptions(screen.getByDisplayValue('All Roles'), 'Admin');

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
  });

  // ── Role change ───────────────────────────────────────────────────────────

  it('optimistically updates role and calls the API', async () => {
    mockUpdateRole.mockResolvedValue({});
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    const roleSelect = screen.getByDisplayValue('Admin');
    await userEvent.selectOptions(roleSelect, 'Manager');

    await waitFor(() =>
      expect(mockUpdateRole).toHaveBeenCalledWith('u1', 'Manager'),
    );
    expect(addToast).toHaveBeenCalledWith(expect.stringContaining('Manager'), 'success');
  });

  it('reverts role and shows error toast when API fails', async () => {
    mockUpdateRole.mockRejectedValue(new Error('fail'));
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    const roleSelect = screen.getByDisplayValue('Admin');
    await userEvent.selectOptions(roleSelect, 'Viewer');

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith('Failed to update role', 'error'),
    );
    // Role reverted back to Admin
    expect(screen.getByDisplayValue('Admin')).toBeInTheDocument();
  });

  // ── Deactivate / activate ─────────────────────────────────────────────────

  it('deactivates a user via the action menu', async () => {
    mockDeactivate.mockResolvedValue({});
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    // Open the MoreVertical actions menu
    const menuTriggers = screen.getAllByRole('button').filter(
      (b) => b.querySelector('svg') && !b.textContent?.trim(),
    );
    await userEvent.click(menuTriggers[0]);
    await userEvent.click(screen.getByRole('button', { name: /deactivate/i }));

    await waitFor(() => expect(mockDeactivate).toHaveBeenCalledWith('u1'));
    expect(addToast).toHaveBeenCalledWith(expect.stringContaining('deactivated'), 'success');
  });

  it('activates an inactive user via the action menu', async () => {
    mockGetAll.mockResolvedValue({
      data: [makeUser({ status: 'Inactive' })],
      page: 1, limit: 8, total: 1,
    });
    mockActivate.mockResolvedValue({});
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    const menuTriggers = screen.getAllByRole('button').filter(
      (b) => b.querySelector('svg') && !b.textContent?.trim(),
    );
    await userEvent.click(menuTriggers[0]);
    await userEvent.click(screen.getByRole('button', { name: /activate/i }));

    await waitFor(() => expect(mockActivate).toHaveBeenCalledWith('u1'));
    expect(addToast).toHaveBeenCalledWith(expect.stringContaining('activated'), 'success');
  });

  // ── Invite modal ──────────────────────────────────────────────────────────

  it('opens the invite modal when "Invite Member" is clicked', async () => {
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    await userEvent.click(screen.getByRole('button', { name: /invite member/i }));

    expect(screen.getByRole('dialog', { name: /invite team member/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('sends an invite and shows success step', async () => {
    mockInvSend.mockResolvedValue({});
    mockInvList.mockResolvedValue([]);

    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    await userEvent.click(screen.getByRole('button', { name: /invite member/i }));
    await userEvent.type(screen.getByLabelText(/email address/i), 'new@company.com');
    await userEvent.click(screen.getByRole('button', { name: /send invite/i }));

    await waitFor(() =>
      expect(mockInvSend).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@company.com', role: 'Viewer' }),
      ),
    );

    // Success step shows the invited email
    await waitFor(() =>
      expect(screen.getByText(/invitation sent!/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/new@company\.com/i)).toBeInTheDocument();
  });

  it('shows error toast when invite API fails', async () => {
    mockInvSend.mockRejectedValue(new Error('Server error'));

    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    await userEvent.click(screen.getByRole('button', { name: /invite member/i }));
    await userEvent.type(screen.getByLabelText(/email address/i), 'x@y.com');
    await userEvent.click(screen.getByRole('button', { name: /send invite/i }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith('Failed to send invitation', 'error'),
    );
  });

  it('closes the modal when Cancel is clicked', async () => {
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    await userEvent.click(screen.getByRole('button', { name: /invite member/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  // ── Pending invitations ───────────────────────────────────────────────────

  it('resends an invitation and shows success toast', async () => {
    mockInvResend.mockResolvedValue({});
    render(<UserManagement />);
    await waitFor(() => expect(screen.getByText('carol@example.com')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /resend/i }));

    await waitFor(() => expect(mockInvResend).toHaveBeenCalledWith('inv1'));
    expect(addToast).toHaveBeenCalledWith(
      expect.stringContaining('carol@example.com'),
      'success',
    );
  });

  it('revokes an invitation and removes it from the list', async () => {
    mockInvRevoke.mockResolvedValue({});
    render(<UserManagement />);
    await waitFor(() => expect(screen.getByText('carol@example.com')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /revoke/i }));

    await waitFor(() => expect(mockInvRevoke).toHaveBeenCalledWith('inv1'));
    await waitFor(() =>
      expect(screen.queryByText('carol@example.com')).not.toBeInTheDocument(),
    );
    expect(addToast).toHaveBeenCalledWith(
      expect.stringContaining('carol@example.com'),
      'success',
    );
  });
});
