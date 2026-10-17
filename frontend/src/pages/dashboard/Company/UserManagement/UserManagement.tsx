import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { usersApi, invitationsApi } from '@services/api';
import type { UserRole, Invitation } from '@services/api';
import { useToast } from '../../../../context/ToastContext';
import { useAuthContext } from '../../../../context/AuthContext';
import { useDebounce } from '../../../../hooks/useDebounce';
import { usePagination } from '../../../../hooks/usePagination';
import Breadcrumb from '@components/common/Breadcrumb';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import UserTable from './UserTable';
import PendingInvitations from './PendingInvitations';
import InviteModal, { type InviteStep } from './InviteModal';
import type { MappedUser } from './types';

function mapApiUser(u: import('@services/api').User): MappedUser {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    lastLogin: u.lastLogin ?? 'Never',
  };
}

const UserManagement: React.FC = () => {
  const { addToast } = useToast();
  const { userId: currentUserId } = useAuthContext();
  const [users, setUsers] = useState<MappedUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [inviteStep, setInviteStep] = useState<InviteStep>('form');
  const [confirmDeactivate, setConfirmDeactivate] = useState<{ id: string; name: string } | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Viewer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [lastInvitedEmail, setLastInvitedEmail] = useState('');

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setInviteStep('form');
    setInviteEmail('');
    setInviteRole('Viewer');
    setInviteMessage('');
  }, []);

  const [total, setTotal] = useState(0);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { currentPage, pageSize: itemsPerPage, setPage: setCurrentPage } = usePagination({
    pageSize: 8,
    resetKey: `${debouncedSearch}|${roleFilter}`,
  });

  const [usersReloadKey, setUsersReloadKey] = useState(0);
  const reloadUsers = useCallback(() => setUsersReloadKey((key) => key + 1), []);
  const [invitationsReloadKey, setInvitationsReloadKey] = useState(0);
  const reloadInvitations = useCallback(() => setInvitationsReloadKey((key) => key + 1), []);

  useEffect(() => {
    let isCurrent = true;
    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);
        const res = await usersApi.getAll({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch || undefined,
          role: roleFilter === 'All' ? undefined : (roleFilter as UserRole),
        });
        if (!isCurrent) return;
        setUsers(res.data.map(mapApiUser));
        setTotal(res.total);
      } catch {
        if (!isCurrent) return;
        setError('Failed to load users. Please try again.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    }
    void loadUsers();
    return () => { isCurrent = false; };
  }, [currentPage, debouncedSearch, itemsPerPage, roleFilter, usersReloadKey]);

  useEffect(() => {
    let isCurrent = true;
    async function loadInvitations() {
      try {
        setInvitationsLoading(true);
        const data = await invitationsApi.list();
        if (isCurrent) setInvitations(data.filter((inv) => inv.status === 'pending'));
      } catch {
        // non-critical
      } finally {
        if (isCurrent) setInvitationsLoading(false);
      }
    }
    void loadInvitations();
    return () => { isCurrent = false; };
  }, [invitationsReloadKey]);

  const totalPages = Math.ceil(total / itemsPerPage) || 1;

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    if (id === currentUserId) {
      addToast('You cannot change your own role.', 'error');
      return;
    }
    const prev = users;
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    setActiveMenu(null);
    try {
      await usersApi.updateRole(id, newRole);
      addToast(`User role updated to ${newRole}`, 'success');
    } catch (err: unknown) {
      setUsers(prev);
      const isLastAdmin =
        typeof err === 'object' && err !== null && 'response' in err &&
        typeof (err as { response?: { status?: number } }).response === 'object' &&
        (err as { response: { status: number } }).response.status === 409;
      addToast(isLastAdmin ? 'Cannot demote the last admin.' : 'Failed to update role', 'error');
    }
  };

  const toggleUserStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    if (id === currentUserId) {
      addToast('You cannot deactivate your own account.', 'error');
      setActiveMenu(null);
      return;
    }
    if (user.status === 'Active') {
      setConfirmDeactivate({ id, name: user.name });
      setActiveMenu(null);
      return;
    }
    const prev = users;
    setUsers(users.map(u => u.id === id ? { ...u, status: 'Active' as const } : u));
    setActiveMenu(null);
    try {
      await usersApi.activate(id);
      addToast('User activated successfully', 'success');
    } catch {
      setUsers(prev);
      addToast('Failed to update user status', 'error');
    }
  };

  const confirmDeactivateAndExecute = async () => {
    if (!confirmDeactivate) return;
    const { id } = confirmDeactivate;
    const prev = users;
    setUsers(users.map(u => u.id === id ? { ...u, status: 'Inactive' as const } : u));
    setActionLoading('deactivate');
    try {
      await usersApi.deactivate(id);
      addToast('User deactivated successfully', 'success');
    } catch {
      setUsers(prev);
      addToast('Failed to update user status', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDeactivate(null);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setActionLoading('invite');
    try {
      await invitationsApi.send({ email: inviteEmail, role: inviteRole, message: inviteMessage || undefined });
      setLastInvitedEmail(inviteEmail);
      setInviteStep('success');
      if (currentPage !== 1) setCurrentPage(1);
      else reloadUsers();
      reloadInvitations();
    } catch {
      addToast('Failed to send invitation', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResend = async (id: string, email: string) => {
    setActionLoading(`resend-${id}`);
    try {
      await invitationsApi.resend(id);
      addToast(`Invitation resent to ${email}`, 'success');
    } catch {
      addToast('Failed to resend invitation', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (id: string, email: string) => {
    setActionLoading(`revoke-${id}`);
    try {
      await invitationsApi.revoke(id);
      setInvitations((prev) => prev.filter((inv) => inv._id !== id));
      addToast(`Invitation to ${email} revoked`, 'success');
    } catch {
      addToast('Failed to revoke invitation', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const pageHeader = (
    <div>
      <h1 className="text-[28px] font-semibold m-0 mb-2">Team Management</h1>
      <p className="text-[15px] text-slate-400 m-0">Manage access, roles, and invite new members to your organization.</p>
    </div>
  );

  if (error) {
    return (
      <div className="px-6 py-8 max-w-[1200px] mx-auto min-h-[calc(100vh-80px)] text-slate-100 max-sm:px-4 max-sm:py-5">
        <div className="flex justify-between items-start mb-8">{pageHeader}</div>
        <div className="flex flex-col items-center justify-center py-16 px-6 text-red-400 gap-3 bg-[#14171E] border border-[#1E293B] rounded-xl text-center">
          <AlertTriangle size={48} />
          <h3 className="m-0 text-lg text-slate-100">Failed to load users</h3>
          <p className="m-0 text-sm text-slate-400">{error}</p>
          <button
            className="flex items-center gap-2 bg-blue-500 text-white border-none rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors"
            onClick={reloadUsers}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-[1200px] mx-auto min-h-[calc(100vh-80px)] text-slate-100 max-sm:px-4 max-sm:py-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }]} current="Team" />

      <div className="flex justify-between items-start mb-8 max-sm:flex-col max-sm:gap-4">
        {pageHeader}
        <button
          className="flex items-center gap-2 bg-blue-500 text-white border-none rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          Invite Member
        </button>
      </div>

      <PendingInvitations
        invitations={invitations}
        loading={invitationsLoading}
        actionLoading={actionLoading}
        onResend={handleResend}
        onRevoke={handleRevoke}
      />

      <div className="flex gap-4 mb-6 max-sm:flex-col">
        <div className="relative flex-1 max-w-[400px] max-sm:max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14171E] border border-[#1E293B] rounded-lg py-2.5 pl-10 pr-4 text-slate-100 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#14171E] border border-[#1E293B] rounded-lg py-2.5 pl-10 pr-9 text-slate-100 text-sm appearance-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 cursor-pointer h-full"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Viewer">Viewer</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 pointer-events-none">▼</span>
        </div>
      </div>

      <UserTable
        users={users}
        loading={loading}
        currentUserId={currentUserId}
        activeMenu={activeMenu}
        onMenuToggle={(id) => setActiveMenu(activeMenu === id ? null : id)}
        onRoleChange={handleRoleChange}
        onToggleStatus={toggleUserStatus}
      />

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-slate-400 text-sm">
            Showing {total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} entries
          </span>
          <div className="flex items-center gap-3">
            <button
              className="bg-[#14171E] border border-[#1E293B] text-slate-100 w-8 h-8 flex items-center justify-center rounded-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[#1E293B] hover:not-disabled:border-[#334155]"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-100">{currentPage}</span>
            <button
              className="bg-[#14171E] border border-[#1E293B] text-slate-100 w-8 h-8 flex items-center justify-center rounded-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[#1E293B] hover:not-disabled:border-[#334155]"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <InviteModal
        isOpen={isModalOpen}
        inviteStep={inviteStep}
        inviteEmail={inviteEmail}
        inviteRole={inviteRole}
        inviteMessage={inviteMessage}
        lastInvitedEmail={lastInvitedEmail}
        actionLoading={actionLoading}
        onClose={closeModal}
        onEmailChange={setInviteEmail}
        onRoleChange={setInviteRole}
        onMessageChange={setInviteMessage}
        onSubmit={handleInviteSubmit}
        onInviteAnother={() => {
          setInviteStep('form');
          setInviteEmail('');
          setInviteMessage('');
          setInviteRole('Viewer');
        }}
      />

      <ConfirmDialog
        isOpen={confirmDeactivate !== null}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={() => void confirmDeactivateAndExecute()}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${confirmDeactivate?.name ?? ''}? They will lose access immediately.`}
        confirmLabel="Deactivate"
        variant="danger"
        isLoading={actionLoading === 'deactivate'}
      />
    </div>
  );
};

export default UserManagement;
