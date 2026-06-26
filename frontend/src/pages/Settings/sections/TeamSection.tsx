import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Users,
  Mail,
  Send,
  X,
  ChevronDown,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  UserPlus,
  Shield,
} from 'lucide-react';
import { usersApi, invitationsApi } from '@services/api/endpoints/users';
import type { UserRole, User, Invitation } from '@services/api/endpoints/users';
import Modal from '@components/common/Modal/Modal';

type TeamMemberStatus = 'Active' | 'Invited' | 'Deactivated';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: TeamMemberStatus;
  lastActive?: string;
  source: 'user' | 'invitation';
  invitationId?: string;
}

interface RoleInfo {
  description: string;
  permissions: string[];
  limitations: string[];
}

const ROLES: UserRole[] = ['Admin', 'Manager', 'Viewer', 'Driver'];

const ROLE_INFO: Record<UserRole, RoleInfo> = {
  Admin: {
    description: 'Full access to all features and settings',
    permissions: [
      'Manage team members',
      'View & manage all shipments',
      'Create & edit shipments',
      'Manage API keys',
      'Access billing & settings',
      'Confirm milestones & release payments',
    ],
    limitations: [],
  },
  Manager: {
    description: 'Can manage shipments and view analytics',
    permissions: [
      'View all shipments',
      'Create & edit shipments',
      'View analytics & dashboard',
      'Confirm milestones',
      'Upload delivery proof',
    ],
    limitations: [
      'Cannot manage team members',
      'Cannot access API keys',
      'Cannot access billing',
    ],
  },
  Viewer: {
    description: 'Read-only access to shipments and dashboard',
    permissions: [
      'View shipments & tracking',
      'View analytics & dashboard',
      'View blockchain ledger',
    ],
    limitations: [
      'Cannot create or edit shipments',
      'Cannot manage team',
      'Cannot access settings',
      'Cannot confirm milestones',
    ],
  },
  Driver: {
    description: 'Mobile access for delivery operations',
    permissions: [
      'View assigned shipments',
      'Update shipment status',
      'Upload delivery proof',
    ],
    limitations: [
      'Cannot view all company shipments',
      'Cannot manage team',
      'Cannot access settings',
    ],
  },
};

const STATUS_COLORS: Record<TeamMemberStatus, string> = {
  Active: 'text-green-400 bg-green-500/10 border-green-500/30',
  Invited: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Deactivated: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

const ALL_ROLES_FILTER = 'All Roles';
const ALL_STATUSES_FILTER = 'All Statuses';

const TeamSection: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES_FILTER);
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUSES_FILTER);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Viewer');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    member: TeamMember;
    type: 'deactivate' | 'activate' | 'resend';
  } | null>(null);
  const [actionLoading, setActionLoading] = useState('');
  const [openRoleDropdown, setOpenRoleDropdown] = useState<string | null>(null);

  const roleDropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, invs] = await Promise.all([
        usersApi.getAll({ limit: 100 }),
        invitationsApi.list(),
      ]);

      const userMembers: TeamMember[] = (usersRes.data ?? []).map((u: User) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status === 'Active' ? 'Active' : 'Deactivated',
        lastActive: u.lastLogin ?? u.updatedAt,
        source: 'user' as const,
      }));

      const invitedMembers: TeamMember[] = invs
        .filter((inv: Invitation) => inv.status === 'pending')
        .map((inv: Invitation) => ({
          id: inv._id,
          name: '',
          email: inv.email,
          role: inv.role,
          status: 'Invited' as TeamMemberStatus,
          lastActive: inv.createdAt,
          source: 'invitation' as const,
          invitationId: inv._id,
        }));

      setMembers([...userMembers, ...invitedMembers]);
    } catch {
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(e.target as Node)
      ) {
        setOpenRoleDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setInviteError('Please enter a valid email address.');
      return;
    }
    setSendingInvite(true);
    setInviteError('');
    try {
      await usersApi.invite({ email: inviteEmail.trim(), role: inviteRole });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('Viewer');
      void fetchMembers();
    } catch (e) {
      setInviteError(
        e instanceof Error ? e.message : 'Failed to send invitation.',
      );
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRoleChange = async (member: TeamMember, newRole: UserRole) => {
    if (member.source !== 'user') return;
    setActionLoading(member.id);
    try {
      await usersApi.updateRole(member.id, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m)),
      );
    } catch {
      // silent
    } finally {
      setActionLoading('');
      setOpenRoleDropdown(null);
    }
  };

  const handleDeactivate = async (member: TeamMember) => {
    setActionLoading(member.id);
    try {
      await usersApi.deactivate(member.id);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, status: 'Deactivated' } : m,
        ),
      );
    } catch {
      // silent
    } finally {
      setActionLoading('');
      setConfirmAction(null);
    }
  };

  const handleActivate = async (member: TeamMember) => {
    setActionLoading(member.id);
    try {
      await usersApi.activate(member.id);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, status: 'Active' } : m,
        ),
      );
    } catch {
      // silent
    } finally {
      setActionLoading('');
      setConfirmAction(null);
    }
  };

  const handleResendInvite = async (member: TeamMember) => {
    if (!member.invitationId) return;
    setActionLoading(member.id);
    try {
      await invitationsApi.resend(member.invitationId);
      setConfirmAction(null);
    } catch {
      // silent
    } finally {
      setActionLoading('');
    }
  };

  const executeConfirm = () => {
    if (!confirmAction) return;
    const { member, type } = confirmAction;
    if (type === 'deactivate') void handleDeactivate(member);
    else if (type === 'activate') void handleActivate(member);
    else if (type === 'resend') void handleResendInvite(member);
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filtered = members.filter((m) => {
    if (roleFilter !== ALL_ROLES_FILTER && m.role !== roleFilter) return false;
    if (statusFilter !== ALL_STATUSES_FILTER && m.status !== statusFilter)
      return false;
    return true;
  });

  const getConfirmTitle = () => {
    if (!confirmAction) return '';
    const { member, type } = confirmAction;
    switch (type) {
      case 'deactivate':
        return `Deactivate ${member.name || member.email}?`;
      case 'activate':
        return `Reactivate ${member.name || member.email}?`;
      case 'resend':
        return `Resend invitation to ${member.email}?`;
    }
  };

  const getConfirmMessage = () => {
    if (!confirmAction) return '';
    const { member, type } = confirmAction;
    switch (type) {
      case 'deactivate':
        return `This will prevent ${member.name || member.email} from accessing the platform. You can reactivate them later.`;
      case 'activate':
        return `This will restore ${member.name || member.email}'s access to the platform.`;
      case 'resend':
        return `A new invitation email will be sent to ${member.email}.`;
    }
  };

  const getConfirmButtonLabel = () => {
    if (!confirmAction) return '';
    switch (confirmAction.type) {
      case 'deactivate':
        return 'Deactivate';
      case 'activate':
        return 'Reactivate';
      case 'resend':
        return 'Resend Invitation';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#62ffff]" />
          <h2 className="text-lg font-semibold">Team Members</h2>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#62ffff] text-black font-semibold text-sm rounded-lg hover:bg-[#4ae8e8]"
        >
          <UserPlus size={16} />
          Invite Member
        </button>
      </div>

      <div className="flex gap-3">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#62ffff]"
        >
          <option value={ALL_ROLES_FILTER}>{ALL_ROLES_FILTER}</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#62ffff]"
        >
          <option value={ALL_STATUSES_FILTER}>{ALL_STATUSES_FILTER}</option>
          <option value="Active">Active</option>
          <option value="Invited">Invited</option>
          <option value="Deactivated">Deactivated</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading team members…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {members.length === 0
              ? 'No team members yet. Invite your first member to get started.'
              : 'No members match the selected filters.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(98,255,255,0.1)] text-left text-slate-400">
                <th className="pb-3 pr-4 font-medium">Member</th>
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Last Active</th>
                <th className="pb-3 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-[rgba(98,255,255,0.05)] hover:bg-[rgba(19,186,186,0.03)]"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#62ffff]/20 flex items-center justify-center text-xs font-bold text-[#62ffff] shrink-0">
                        {m.name
                          ? m.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {m.name || '—'}
                        </p>
                        <p className="text-xs text-slate-400">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 relative">
                    {m.source === 'user' ? (
                      <div className="relative" ref={roleDropdownRef}>
                        <button
                          onClick={() =>
                            setOpenRoleDropdown(
                              openRoleDropdown === m.id ? null : m.id,
                            )
                          }
                          disabled={actionLoading === m.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[rgba(19,186,186,0.08)] border border-[rgba(98,255,255,0.2)] rounded-lg text-sm text-white hover:bg-[rgba(19,186,186,0.15)] disabled:opacity-50"
                        >
                          <Shield size={14} className="text-[#62ffff]" />
                          {m.role}
                          <ChevronDown size={14} />
                        </button>
                        {openRoleDropdown === m.id && (
                          <div className="absolute left-0 top-full mt-1 z-20 w-40 bg-[#1a1f2e] border border-[rgba(98,255,255,0.2)] rounded-lg shadow-xl py-1">
                            {ROLES.map((role) => (
                              <button
                                key={role}
                                onClick={() =>
                                  void handleRoleChange(m, role)
                                }
                                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[rgba(19,186,186,0.1)] ${
                                  m.role === role
                                    ? 'text-[#62ffff]'
                                    : 'text-white'
                                }`}
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-slate-400">
                        <Mail size={14} />
                        {m.role}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[m.status]}`}
                    >
                      {m.status === 'Active' && <UserCheck size={12} />}
                      {m.status === 'Invited' && <Clock size={12} />}
                      {m.status === 'Deactivated' && <UserX size={12} />}
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-400">
                    {m.status === 'Invited'
                      ? `Invited ${formatDate(m.lastActive)}`
                      : formatDate(m.lastActive)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {m.source === 'user' && m.status === 'Active' && (
                        <button
                          onClick={() =>
                            setConfirmAction({ member: m, type: 'deactivate' })
                          }
                          disabled={actionLoading === m.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                        >
                          <UserX size={14} />
                          Deactivate
                        </button>
                      )}
                      {m.source === 'user' && m.status === 'Deactivated' && (
                        <button
                          onClick={() =>
                            setConfirmAction({ member: m, type: 'activate' })
                          }
                          disabled={actionLoading === m.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg disabled:opacity-50"
                        >
                          <UserCheck size={14} />
                          Reactivate
                        </button>
                      )}
                      {m.source === 'invitation' && m.status === 'Invited' && (
                        <button
                          onClick={() =>
                            setConfirmAction({ member: m, type: 'resend' })
                          }
                          disabled={actionLoading === m.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#62ffff] hover:text-white hover:bg-[rgba(19,186,186,0.1)] rounded-lg disabled:opacity-50"
                        >
                          <Send size={14} />
                          Resend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteError('');
          setShowRoleInfo(false);
        }}
        title="Invite Team Member"
        size="md"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <button
              onClick={() => {
                setShowInviteModal(false);
                setInviteError('');
                setShowRoleInfo(false);
              }}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleInvite()}
              disabled={sendingInvite}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#62ffff] text-black font-semibold text-sm rounded-lg hover:bg-[#4ae8e8] disabled:opacity-50"
            >
              {sendingInvite ? 'Sending…' : 'Send Invitation'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                setInviteError('');
              }}
              placeholder="colleague@company.com"
              className="w-full bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-white">
                Role
              </label>
              <button
                onClick={() => setShowRoleInfo(!showRoleInfo)}
                className="text-xs text-[#62ffff] hover:text-white"
              >
                {showRoleInfo ? 'Hide details' : 'View role details'}
              </button>
            </div>
            <div className="flex gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setInviteRole(role)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    inviteRole === role
                      ? 'bg-[rgba(19,186,186,0.15)] text-[#62ffff] border-[#62ffff]'
                      : 'bg-[rgba(19,186,186,0.05)] text-slate-400 border-[rgba(98,255,255,0.2)] hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {showRoleInfo && (
            <div className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.1)] rounded-lg p-4 space-y-4">
              {ROLES.map((role) => (
                <div key={role}>
                  <p className="text-sm font-semibold text-[#62ffff] mb-1">
                    {role}
                  </p>
                  <p className="text-xs text-slate-400 mb-1.5">
                    {ROLE_INFO[role].description}
                  </p>
                  {ROLE_INFO[role].permissions.length > 0 && (
                    <div className="mb-1">
                      <p className="text-xs text-green-400 font-medium mb-0.5">
                        Can:
                      </p>
                      <ul className="text-xs text-slate-400 list-disc list-inside">
                        {ROLE_INFO[role].permissions.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ROLE_INFO[role].limitations.length > 0 && (
                    <div>
                      <p className="text-xs text-red-400 font-medium mb-0.5">
                        Cannot:
                      </p>
                      <ul className="text-xs text-slate-400 list-disc list-inside">
                        {ROLE_INFO[role].limitations.map((l) => (
                          <li key={l}>{l}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {inviteError && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle size={14} />
              {inviteError}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        title={getConfirmTitle()}
        size="sm"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={executeConfirm}
              disabled={actionLoading !== ''}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg disabled:opacity-50 ${
                confirmAction?.type === 'deactivate'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : confirmAction?.type === 'activate'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-[#62ffff] text-black hover:bg-[#4ae8e8]'
              }`}
            >
              {actionLoading ? 'Processing…' : getConfirmButtonLabel()}
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={20}
            className={`shrink-0 mt-0.5 ${
              confirmAction?.type === 'deactivate'
                ? 'text-red-400'
                : confirmAction?.type === 'activate'
                  ? 'text-green-400'
                  : 'text-[#62ffff]'
            }`}
          />
          <p className="text-sm text-slate-400">{getConfirmMessage()}</p>
        </div>
      </Modal>
    </div>
  );
};

export default TeamSection;
