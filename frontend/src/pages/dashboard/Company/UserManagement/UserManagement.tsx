import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Search, Filter, Plus, ChevronLeft, ChevronRight, MoreVertical,
  X, Loader2, AlertTriangle, Mail, RefreshCw, Trash2, Clock,
} from 'lucide-react';
import { usersApi, invitationsApi } from '@services/api';
import type { User as ApiUser, UserRole, Invitation } from '@services/api';
import { useToast } from '../../../../context/ToastContext';
import { useFocusTrap } from '../../../../hooks/useFocusTrap';
import { usePagination } from '../../../../hooks/usePagination';
import Avatar from '../../../../components/ui/Avatar';
import Breadcrumb from '@components/common/Breadcrumb';

interface MappedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

function mapApiUser(u: ApiUser): MappedUser {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    lastLogin: u.lastLogin ?? 'Never',
  };
}

type ActionMenuState = string | null;
type InviteStep = 'form' | 'success';

const UserManagement: React.FC = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState<MappedUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const { currentPage, pageSize: itemsPerPage, setPage: setCurrentPage, reset: resetPage } = usePagination({ pageSize: 8 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActionMenuState>(null);
  const [loading, setLoading] = useState(true);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [inviteStep, setInviteStep] = useState<InviteStep>('form');

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

  const inviteModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(inviteModalRef, isModalOpen, closeModal);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await usersApi.getAll();
      setUsers(res.data.map(mapApiUser));
    } catch {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      setInvitationsLoading(true);
      const data = await invitationsApi.list();
      setInvitations(data.filter((inv) => inv.status === 'pending'));
    } catch {
      // non-critical
    } finally {
      setInvitationsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchUsers();
      fetchInvitations();
    });
  }, [fetchUsers, fetchInvitations]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    const prev = users;
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    setActiveMenu(null);
    try {
      await usersApi.updateRole(id, newRole);
      addToast(`User role updated to ${newRole}`, 'success');
    } catch {
      setUsers(prev);
      addToast('Failed to update role', 'error');
    }
  };

  const toggleUserStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const prev = users;
    const newStatus = user.status === 'Active' ? 'Inactive' as const : 'Active' as const;
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    setActiveMenu(null);
    try {
      if (newStatus === 'Inactive') { await usersApi.deactivate(id); }
      else { await usersApi.activate(id); }
      addToast(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch {
      setUsers(prev);
      addToast('Failed to update user status', 'error');
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
      await fetchInvitations();
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

  // Single page-level heading shared by the error and loaded render states so
  // the page always exposes just one top-level heading.
  const pageHeader = (
    <div>
      <h1 className="text-[28px] font-semibold m-0 mb-2">Team Management</h1>
      <p className="text-[15px] text-slate-400 m-0">Manage access, roles, and invite new members to your organization.</p>
    </div>
  );

  if (error) {
    return (
      <div className="px-6 py-8 max-w-[1200px] mx-auto min-h-[calc(100vh-80px)] text-slate-100 max-sm:px-4 max-sm:py-5">
        <div className="flex justify-between items-start mb-8">
          {pageHeader}
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-6 text-red-400 gap-3 bg-[#14171E] border border-[#1E293B] rounded-xl text-center">
          <AlertTriangle size={48} />
          <h3 className="m-0 text-lg text-slate-100">Failed to load users</h3>
          <p className="m-0 text-sm text-slate-400">{error}</p>
          <button
            className="flex items-center gap-2 bg-blue-500 text-white border-none rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors"
            onClick={fetchUsers}
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

      {(invitations.length > 0 || invitationsLoading) && (
        <div className="bg-[#14171e] border border-[#2d3748] border-l-[3px] border-l-amber-400 rounded-[10px] px-5 py-4 mb-5">
          <div className="flex items-center mb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-100 m-0">Pending Invitations</h2>
              <span className="inline-flex items-center justify-center bg-[rgba(245,158,11,0.15)] text-amber-400 rounded-full text-[11px] font-bold px-[7px] py-px min-w-[20px]">
                {invitations.length}
              </span>
            </div>
          </div>
          {invitationsLoading ? (
            <div className="flex flex-col items-center justify-center py-4 text-slate-400 gap-3">
              <Loader2 className="animate-spin" size={20} />
              <p className="m-0 text-sm">Loading…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {invitations.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between bg-[rgba(30,41,59,0.4)] border border-[#1E293B] rounded-lg px-[14px] py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[rgba(245,158,11,0.1)] rounded-full flex items-center justify-center text-amber-400 shrink-0">
                      <Mail size={16} />
                    </div>
                    <div>
                      <span className="text-[13px] font-medium text-slate-200 mr-2">{inv.email}</span>
                      <span className="text-[11px] font-medium text-slate-400 bg-[#1e293b] rounded px-2 py-0.5">{inv.role}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-[5px] border-none rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[rgba(59,130,246,0.1)] text-blue-400 hover:bg-[rgba(59,130,246,0.2)]"
                      disabled={actionLoading === `resend-${inv._id}`}
                      onClick={() => handleResend(inv._id, inv.email)}
                    >
                      {actionLoading === `resend-${inv._id}` ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      Resend
                    </button>
                    <button
                      className="flex items-center gap-[5px] border-none rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[rgba(239,68,68,0.08)] text-red-400 hover:bg-[rgba(239,68,68,0.15)]"
                      disabled={actionLoading === `revoke-${inv._id}`}
                      onClick={() => handleRevoke(inv._id, inv.email)}
                    >
                      {actionLoading === `revoke-${inv._id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4 mb-6 max-sm:flex-col">
        <div className="relative flex-1 max-w-[400px] max-sm:max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full bg-[#14171E] border border-[#1E293B] rounded-lg py-2.5 pl-10 pr-4 text-slate-100 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); resetPage(); }}
            className="bg-[#14171E] border border-[#1E293B] rounded-lg py-2.5 pl-10 pr-9 text-slate-100 text-sm appearance-none outline-none cursor-pointer h-full"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Viewer">Viewer</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 pointer-events-none">▼</span>
        </div>
      </div>

      <div className="bg-[#14171E] border border-[#1E293B] rounded-xl overflow-x-auto mb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="m-0 text-sm">Loading team members...</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-400 border-b border-[#1E293B] uppercase tracking-[0.5px]">User</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-400 border-b border-[#1E293B] uppercase tracking-[0.5px]">Role</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-400 border-b border-[#1E293B] uppercase tracking-[0.5px]">Status</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-400 border-b border-[#1E293B] uppercase tracking-[0.5px]">Last Login</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-400 border-b border-[#1E293B] uppercase tracking-[0.5px] w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[rgba(30,41,59,0.4)] [&:last-child_td]:border-b-0">
                    <td className="px-6 py-4 border-b border-[#1E293B] align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-100 text-sm">{user.name}</span>
                          <span className="text-slate-400 text-[13px]">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-[#1E293B] align-middle">
                      <select
                        className="bg-transparent text-slate-200 border border-transparent px-2 py-1.5 rounded-md text-sm cursor-pointer outline-none transition-all hover:bg-[#1E293B] hover:border-[#334155] focus:bg-[#1E293B] focus:border-[#334155] [&>option]:bg-[#14171E] [&>option]:text-slate-100"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 border-b border-[#1E293B] align-middle">
                      <span className={`inline-block px-3 py-1 rounded-[20px] text-xs font-medium capitalize ${
                        user.status === 'Active'
                          ? 'bg-[rgba(16,185,129,0.1)] text-emerald-400'
                          : 'bg-[rgba(100,116,139,0.1)] text-slate-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-[#1E293B] align-middle text-slate-400 text-[13px]">{user.lastLogin}</td>
                    <td className="px-6 py-4 border-b border-[#1E293B] align-middle w-20 text-center">
                      <div className="relative inline-block">
                        <button
                          className="bg-transparent border-none text-slate-400 p-1.5 rounded-md cursor-pointer transition-all hover:bg-[#1E293B] hover:text-slate-100"
                          onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        >
                          <MoreVertical size={18} />
                        </button>
                        {activeMenu === user.id && (
                          <div className="absolute right-0 top-full mt-1 bg-[#14171E] border border-[#1E293B] rounded-lg p-1 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)] z-10 min-w-[140px]">
                            <button
                              className="block w-full text-left px-3 py-2 bg-transparent border-none text-slate-300 text-[13px] cursor-pointer rounded hover:bg-[#1E293B]"
                              onClick={() => toggleUserStatus(user.id)}
                            >
                              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              className="block w-full text-left px-3 py-2 bg-transparent border-none text-slate-300 text-[13px] cursor-pointer rounded hover:bg-[#1E293B]"
                              onClick={() => setActiveMenu(null)}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-500">No users found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-slate-400 text-sm">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
          </span>
          <div className="flex items-center gap-3">
            <button
              className="bg-[#14171E] border border-[#1E293B] text-slate-100 w-8 h-8 flex items-center justify-center rounded-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[#1E293B] hover:not-disabled:border-[#334155]"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-100">{currentPage}</span>
            <button
              className="bg-[#14171E] border border-[#1E293B] text-slate-100 w-8 h-8 flex items-center justify-center rounded-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[#1E293B] hover:not-disabled:border-[#334155]"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div
            ref={inviteModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
            tabIndex={-1}
            className="bg-[#14171E] border border-[#1E293B] rounded-xl w-full max-w-[460px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] overflow-hidden animate-modal-in max-sm:mx-4 max-sm:w-auto"
          >
            <div className="flex justify-between items-center px-6 py-6 border-b border-[#1E293B]">
              <h2 id="invite-modal-title" className="text-lg font-semibold m-0">
                {inviteStep === 'success' ? 'Invitation Sent!' : 'Invite Team Member'}
              </h2>
              <button
                className="bg-transparent border-none text-slate-400 cursor-pointer p-1 flex rounded hover:bg-[#1E293B] hover:text-slate-100 transition-colors"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            {inviteStep === 'success' ? (
              <div className="px-6 py-6 flex flex-col gap-5 items-center text-center">
                <div className="w-14 h-14 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center text-emerald-400 mb-1">
                  <Mail size={32} />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed m-0">
                  An invitation has been sent to <strong className="text-slate-100">{lastInvitedEmail}</strong>.
                  They'll receive an email with a link to create their account.
                </p>
                <div className="flex justify-end gap-3 mt-3 w-full">
                  <button
                    type="button"
                    className="bg-transparent border border-[#1E293B] text-slate-100 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#1E293B] transition-all"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="bg-blue-500 border-none text-white px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors"
                    onClick={() => { setInviteStep('form'); setInviteEmail(''); setInviteMessage(''); setInviteRole('Viewer'); }}
                  >
                    Invite Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="px-6 py-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inviteEmail" className="text-[13px] font-medium text-slate-400">Email Address *</label>
                  <input
                    type="email"
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="bg-[#0b0e14] border border-[#1E293B] rounded-lg px-[14px] py-2.5 text-slate-100 text-sm outline-none font-[inherit] focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inviteRole" className="text-[13px] font-medium text-slate-400">Role *</label>
                  <select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="bg-[#0b0e14] border border-[#1E293B] rounded-lg px-[14px] py-2.5 text-slate-100 text-sm outline-none font-[inherit] focus:border-blue-500 transition-colors [&>option]:bg-[#14171E]"
                  >
                    <option value="Admin">Admin — Full access</option>
                    <option value="Manager">Manager — Edit &amp; View</option>
                    <option value="Viewer">Viewer — Read only</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inviteMessage" className="text-[13px] font-medium text-slate-400">Personal Message (optional)</label>
                  <textarea
                    id="inviteMessage"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Add a personal note to the invitation email…"
                    rows={3}
                    className="bg-[#0b0e14] border border-[#1E293B] rounded-lg px-[14px] py-2.5 text-slate-100 text-sm outline-none font-[inherit] focus:border-blue-500 transition-colors resize-y min-h-[72px]"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    type="button"
                    className="bg-transparent border border-[#1E293B] text-slate-100 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#1E293B] transition-all"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!inviteEmail.trim() || actionLoading === 'invite'}
                    className="bg-blue-500 border-none text-white px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading === 'invite' ? 'Sending…' : 'Send Invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
