import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, UserPlus, Users } from 'lucide-react';
import { usersApi, invitationsApi } from '@services/api/endpoints/users';
import type { UserRole, User, Invitation } from '@services/api/endpoints/users';
import Modal from '@components/common/Modal/Modal';
import { TeamInviteModal } from './team/TeamInviteModal';
import { TeamMemberList } from './team/TeamMemberList';
import {
  ALL_ROLES_FILTER,
  ALL_STATUSES_FILTER,
  ROLES,
} from './team/types';
import type { ConfirmAction, TeamMember, TeamMemberStatus } from './team/types';

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
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState('');

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
    const timer = setTimeout(() => {
      void fetchMembers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

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

      <TeamMemberList
        members={filtered}
        totalCount={members.length}
        isLoading={isLoading}
        actionLoading={actionLoading}
        onRoleChange={(member, newRole) => {
          void handleRoleChange(member, newRole);
        }}
        onRequestConfirm={setConfirmAction}
      />

      <TeamInviteModal
        isOpen={showInviteModal}
        email={inviteEmail}
        role={inviteRole}
        sending={sendingInvite}
        error={inviteError}
        onEmailChange={(email) => {
          setInviteEmail(email);
          setInviteError('');
        }}
        onRoleChange={setInviteRole}
        onSubmit={() => {
          void handleInvite();
        }}
        onClose={() => {
          setShowInviteModal(false);
          setInviteError('');
        }}
      />

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
