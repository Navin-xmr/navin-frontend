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

// Default: no logged-in user matches any fixture user
const mockUseAuthContext = vi.fn(() => ({
  userId: null as string | null,
  role: 'Admin' as const,
  isAuthenticated: true,
  isLoading: false,
  logout: vi.fn(),
}));
vi.mock('../../../../context/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
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

vi.mock('@components/ui/ConfirmDialog', () => ({
  default: ({ isOpen, onConfirm, onClose, title }: {
    isOpen: boolean; onConfirm: () => void; onClose: () => void; title: string;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel dialog</button>
      </div>
    ) : null,
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
    // Reset to default: no logged-in user matches any fixture, so self-guard never fires
    mockUseAuthContext.mockReturnValue({ userId: null, role: 'Admin' as const, isAuthenticated: true, isLoading: false, logout: vi.fn() });
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

  it('sends search query to the API (debounced) and renders server results', async () => {
    // First call returns both users; second call (after debounce) returns only Alice.
    mockGetAll
      .mockResolvedValueOnce({ data: [makeUser(), makeUser({ _id: 'u2', name: 'Bob Jones', email: 'bob@example.com', role: 'Viewer' })], page: 1, limit: 8, total: 2 })
      .mockResolvedValueOnce({ data: [makeUser()], page: 1, limit: 8, total: 1 });
    mockInvList.mockResolvedValue([]);

    render(<UserManagement />);
    await waitFor(() => screen.getByText('Bob Jones'));

    await userEvent.type(screen.getByPlaceholderText(/search by name or email/i), 'Alice');

    // After debounce the API is called with the search param.
    await waitFor(() =>
      expect(mockGetAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'Alice' }),
      ),
    );
    // Server returns only Alice; Bob should no longer be in the DOM.
    await waitFor(() => expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument());
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('shows empty table row when search yields no results', async () => {
    mockGetAll
      .mockResolvedValueOnce({ data: [makeUser()], page: 1, limit: 8, total: 1 })
      .mockResolvedValueOnce({ data: [], page: 1, limit: 8, total: 0 });
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    await userEvent.type(screen.getByPlaceholderText(/search by name or email/i), 'zzznobody');

    await waitFor(() =>
      expect(mockGetAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'zzznobody' }),
      ),
    );
    await waitFor(() =>
      expect(screen.getByText(/no users found matching your criteria/i)).toBeInTheDocument(),
    );
  });

  it('sends role filter to the API and renders server results', async () => {
    // Initial call returns all; after role select, only Admins.
    mockGetAll
      .mockResolvedValueOnce({ data: [makeUser(), makeUser({ _id: 'u2', name: 'Bob Jones', email: 'bob@example.com', role: 'Viewer' })], page: 1, limit: 8, total: 2 })
      .mockResolvedValueOnce({ data: [makeUser()], page: 1, limit: 8, total: 1 });
    mockInvList.mockResolvedValue([]);

    render(<UserManagement />);
    await waitFor(() => screen.getByText('Bob Jones'));

    await userEvent.selectOptions(screen.getByDisplayValue('All Roles'), 'Admin');

    await waitFor(() =>
      expect(mockGetAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ role: 'Admin' }),
      ),
    );
    await waitFor(() => expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument());
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
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

    // Confirm in the dialog
    await waitFor(() => screen.getByRole('dialog', { name: /deactivate user/i }));
    await userEvent.click(screen.getByRole('button', { name: /^confirm$/i }));

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

  // ── Server-side pagination ────────────────────────────────────────────────

  it('passes page, limit, search and role to the API and drives pager from response total', async () => {
    // 9 total users — enough to require a second page with pageSize=8.
    const page1Users = Array.from({ length: 8 }, (_, i) =>
      makeUser({ _id: `u${i + 1}`, name: `User ${i + 1}`, email: `u${i + 1}@example.com` }),
    );
    const page2Users = [makeUser({ _id: 'u9', name: 'User 9', email: 'u9@example.com' })];

    mockGetAll
      .mockResolvedValueOnce({ data: page1Users, page: 1, limit: 8, total: 9 })
      .mockResolvedValueOnce({ data: page2Users, page: 2, limit: 8, total: 9 });
    mockInvList.mockResolvedValue([]);

    render(<UserManagement />);
    await waitFor(() => screen.getByText('User 1'));

    // Initial API call must include page and limit.
    expect(mockGetAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 8 }),
    );

    // The pager is driven by response.total=9 > limit=8, so nav buttons appear.
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    expect(nextBtn).toBeDefined();
    await userEvent.click(nextBtn);

    // After navigating, the API must be called with page: 2.
    await waitFor(() =>
      expect(mockGetAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2, limit: 8 }),
      ),
    );
    await waitFor(() => expect(screen.getByText('User 9')).toBeInTheDocument());
  });

  // ── Self-guard (#889) ─────────────────────────────────────────────────────

  it('disables the role select for the currently signed-in user', async () => {
    mockUseAuthContext.mockReturnValue({ userId: 'u1', role: 'Admin', isAuthenticated: true, isLoading: false, logout: vi.fn() });
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    // The role dropdown for the current user should be disabled
    const roleSelects = screen.getAllByRole('combobox');
    const selfSelect = roleSelects.find((s) => (s as HTMLSelectElement).value === 'Admin');
    expect(selfSelect).toBeDefined();
    expect(selfSelect).toBeDisabled();
  });

  it('shows an error toast when trying to change own role (extra guard)', async () => {
    mockUseAuthContext.mockReturnValue({ userId: 'u1', role: 'Admin', isAuthenticated: true, isLoading: false, logout: vi.fn() });
    mockUpdateRole.mockResolvedValue({});
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    // Directly trigger handleRoleChange by enabling select and changing it
    // In practice the select is disabled, but we test the function guard anyway
    // by finding the disabled select and forcefully firing a change event
    const roleSelects = screen.getAllByRole('combobox');
    const selfSelect = roleSelects.find((s) => (s as HTMLSelectElement).value === 'Admin')!;
    // Remove disabled attribute temporarily and fire change
    selfSelect.removeAttribute('disabled');
    await userEvent.selectOptions(selfSelect, 'Viewer');

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith('You cannot change your own role.', 'error'),
    );
    expect(mockUpdateRole).not.toHaveBeenCalled();
  });

  it('shows confirm dialog before deactivating another user', async () => {
    mockDeactivate.mockResolvedValue({});
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    const menuTriggers = screen.getAllByRole('button').filter(
      (b) => b.querySelector('svg') && !b.textContent?.trim(),
    );
    await userEvent.click(menuTriggers[0]);
    await userEvent.click(screen.getByRole('button', { name: /deactivate/i }));

    // ConfirmDialog should now be open
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: /deactivate user/i })).toBeInTheDocument(),
    );
    // API not called yet
    expect(mockDeactivate).not.toHaveBeenCalled();
  });

  it('deactivates user after confirmation', async () => {
    mockDeactivate.mockResolvedValue({});
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    const menuTriggers = screen.getAllByRole('button').filter(
      (b) => b.querySelector('svg') && !b.textContent?.trim(),
    );
    await userEvent.click(menuTriggers[0]);

    // Click Deactivate to open confirm dialog
    const deactivateBtn = await waitFor(() => screen.getByRole('button', { name: /deactivate/i }));
    await userEvent.click(deactivateBtn);

    // Confirm in the dialog
    await waitFor(() => screen.getByRole('dialog', { name: /deactivate user/i }));
    await userEvent.click(screen.getByRole('button', { name: /^confirm$/i }));

    await waitFor(() => expect(mockDeactivate).toHaveBeenCalledWith('u1'));
    expect(addToast).toHaveBeenCalledWith(expect.stringContaining('deactivated'), 'success');
  });

  it('shows last-admin error toast on 409 role change', async () => {
    // Set up: two users, current user is u2 so Alice (u1) is not blocked by self-guard
    mockUseAuthContext.mockReturnValue({ userId: 'u2', role: 'Admin', isAuthenticated: true, isLoading: false, logout: vi.fn() });
    mockGetAll.mockResolvedValue({
      data: [
        makeUser(),
        makeUser({ _id: 'u2', name: 'Bob Jones', email: 'bob@example.com', role: 'Admin' }),
      ],
      page: 1, limit: 8, total: 2,
    });
    mockInvList.mockResolvedValue([]);
    const err = Object.assign(new Error('last admin'), { response: { status: 409 } });
    mockUpdateRole.mockRejectedValue(err);

    render(<UserManagement />);
    await waitFor(() => screen.getByText('Alice Smith'));

    // Change Alice's role — she's u1, current user is u2, so self-guard doesn't fire
    const roleSelects = screen.getAllByRole('combobox');
    // Find Alice's select (not disabled, first Admin select)
    const aliceSelect = roleSelects.find(
      (s) => (s as HTMLSelectElement).value === 'Admin' && !s.hasAttribute('disabled'),
    )!;
    await userEvent.selectOptions(aliceSelect, 'Viewer');

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith('Cannot demote the last admin.', 'error'),
    );
  });
});
