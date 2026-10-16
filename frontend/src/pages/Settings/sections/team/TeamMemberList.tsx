import React from 'react';
import { Clock, Send, UserCheck, Users, UserX } from 'lucide-react';
import type { UserRole } from '@services/api/endpoints/users';
import { formatDate } from '@utils/localeFormat';
import { TeamRoleEditor } from './TeamRoleEditor';
import { STATUS_COLORS } from './types';
import type { ConfirmAction, TeamMember } from './types';

export interface TeamMemberListProps {
  members: TeamMember[];
  totalCount: number;
  isLoading: boolean;
  actionLoading: string;
  onRoleChange: (member: TeamMember, newRole: UserRole) => void;
  onRequestConfirm: (action: ConfirmAction) => void;
}

export const TeamMemberList: React.FC<TeamMemberListProps> = ({
  members,
  totalCount,
  isLoading,
  actionLoading,
  onRoleChange,
  onRequestConfirm,
}) => {
  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading team members…</p>;
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Users size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">
          {totalCount === 0
            ? 'No team members yet. Invite your first member to get started.'
            : 'No members match the selected filters.'}
        </p>
      </div>
    );
  }

  return (
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
          {members.map((m) => (
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
                <TeamRoleEditor
                  member={m}
                  disabled={actionLoading === m.id}
                  onRoleChange={onRoleChange}
                />
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
                        onRequestConfirm({ member: m, type: 'deactivate' })
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
                        onRequestConfirm({ member: m, type: 'activate' })
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
                        onRequestConfirm({ member: m, type: 'resend' })
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
  );
};

export default TeamMemberList;
