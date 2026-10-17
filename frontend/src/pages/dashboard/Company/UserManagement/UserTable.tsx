import React from 'react';
import { MoreVertical, Loader2 } from 'lucide-react';
import type { UserRole } from '@services/api';
import Avatar from '@components/ui/Avatar';
import type { MappedUser } from './types';

export interface UserTableProps {
  users: MappedUser[];
  loading: boolean;
  currentUserId: string | null;
  activeMenu: string | null;
  onMenuToggle: (id: string) => void;
  onRoleChange: (id: string, newRole: UserRole) => void;
  onToggleStatus: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  currentUserId,
  activeMenu,
  onMenuToggle,
  onRoleChange,
  onToggleStatus,
}) => {
  return (
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
            {users.length > 0 ? (
              users.map((user) => (
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
                      className={`bg-transparent text-slate-200 border border-transparent px-2 py-1.5 rounded-md text-sm outline-none transition-all hover:bg-[#1E293B] hover:border-[#334155] focus:bg-[#1E293B] focus:border-[#334155] [&>option]:bg-[#14171E] [&>option]:text-slate-100 ${user.id === currentUserId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      value={user.role}
                      disabled={user.id === currentUserId}
                      title={user.id === currentUserId ? 'You cannot change your own role' : undefined}
                      onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)}
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
                        onClick={() => onMenuToggle(user.id)}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {activeMenu === user.id && (
                        <div className="absolute right-0 top-full mt-1 bg-[#14171E] border border-[#1E293B] rounded-lg p-1 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)] z-10 min-w-[140px]">
                          <button
                            className="block w-full text-left px-3 py-2 bg-transparent border-none text-slate-300 text-[13px] cursor-pointer rounded hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={user.id === currentUserId}
                            title={user.id === currentUserId ? 'You cannot deactivate your own account' : undefined}
                            onClick={() => onToggleStatus(user.id)}
                          >
                            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="block w-full text-left px-3 py-2 bg-transparent border-none text-slate-300 text-[13px] cursor-pointer rounded hover:bg-[#1E293B]"
                            onClick={() => onMenuToggle(user.id)}
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
  );
};

export default UserTable;
