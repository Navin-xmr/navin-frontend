import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, MoreVertical, X, Loader2, AlertTriangle } from 'lucide-react';
import { usersApi } from '@services/api';
import type { User as ApiUser, UserRole } from '@services/api';
import { useToast } from '../../../../context/ToastContext';
import { useFocusTrap } from '../../../../hooks/useFocusTrap';
import './UserManagement.css';

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

const UserManagement: React.FC = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState<MappedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActionMenuState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const inviteModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(inviteModalRef, isModalOpen, () => setIsModalOpen(false));

  // Modal Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Viewer');

  const itemsPerPage = 8;

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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      if (newStatus === 'Inactive') {
        await usersApi.deactivate(id);
      } else {
        await usersApi.activate(id);
      }
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
      const newUser = await usersApi.invite({ email: inviteEmail, role: inviteRole });
      setUsers([mapApiUser(newUser), ...users]);
      setInviteEmail('');
      setInviteRole('Viewer');
      setIsModalOpen(false);
      addToast(`Invitation sent to ${inviteEmail}`, 'success');
    } catch {
      addToast('Failed to send invitation', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (error) {
    return (
      <div className="user-management-container">
        <div className="um-header">
          <div className="um-title">
            <h1>Team Management</h1>
            <p>Manage access, roles, and invite new members to your organization.</p>
          </div>
        </div>
        <div className="error-state">
          <AlertTriangle size={48} />
          <h3>Failed to load users</h3>
          <p>{error}</p>
          <button className="invite-btn" onClick={fetchUsers}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="um-header">
        <div className="um-title">
          <h1>Team Management</h1>
          <p>Manage access, roles, and invite new members to your organization.</p>
        </div>
        <button className="invite-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Invite User
        </button>
      </div>

      <div className="um-controls">
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-dropdown">
          <Filter className="filter-icon" size={18} />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
      </div>

      <div className="um-table-wrapper">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="spin-icon" size={32} />
            <p>Loading team members...</p>
          </div>
        ) : (
          <table className="um-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className="inline-role-select"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="last-login">{user.lastLogin}</td>
                    <td className="actions-col">
                      <div className="action-menu-container">
                        <button
                          className="action-menu-btn"
                          onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {activeMenu === user.id && (
                          <div className="action-dropdown">
                            <button onClick={() => toggleUserStatus(user.id)}>
                              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => setActiveMenu(null)}>
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
                  <td colSpan={5} className="empty-state">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <span className="page-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
          </span>
          <div className="page-controls">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="current-page">{currentPage}</span>
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div
            ref={inviteModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
            tabIndex={-1}
            className="invite-modal"
          >
            <div className="modal-header">
              <h2 id="invite-modal-title">Invite New User</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInviteSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="inviteEmail">Email Address</label>
                <input
                  type="email"
                  id="inviteEmail"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="inviteRole">Role</label>
                <select
                  id="inviteRole"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                >
                  <option value="Admin">Admin - Full Access</option>
                  <option value="Manager">Manager - Edit & View</option>
                  <option value="Viewer">Viewer - Read Only</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={!inviteEmail.trim() || actionLoading === 'invite'}>
                  {actionLoading === 'invite' ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
