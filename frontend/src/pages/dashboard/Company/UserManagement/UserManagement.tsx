import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Search, Filter, Plus, ChevronLeft, ChevronRight, MoreVertical,
  X, Loader2, AlertTriangle, Mail, RefreshCw, Trash2, Clock,
} from 'lucide-react';
import { usersApi, invitationsApi } from '@services/api';
import type { User as ApiUser, UserRole, Invitation } from '@services/api';
import { useToast } from '../../../../context/ToastContext';
import { useFocusTrap } from '../../../../hooks/useFocusTrap';
import Avatar from '../../../../components/ui/Avatar';
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
type InviteStep = 'form' | 'success';

const UserManagement: React.FC = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState<MappedUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
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
          Invite Member
        </button>
      </div>

      {(invitations.length > 0 || invitationsLoading) && (
        <div className="pending-invitations-section">
          <div className="pending-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} style={{ color: '#f59e0b' }} />
              <h2 className="pending-title">Pending Invitations</h2>
              <span className="pending-count">{invitations.length}</span>
            </div>
          </div>
          {invitationsLoading ? (
            <div className="loading-state" style={{ padding: '16px 0' }}>
              <Loader2 className="spin-icon" size={20} />
              <p>Loading…</p>
            </div>
          ) : (
            <div className="pending-list">
              {invitations.map((inv) => (
                <div key={inv._id} className="pending-item">
                  <div className="pending-info">
                    <div className="pending-avatar"><Mail size={16} /></div>
                    <div>
                      <span className="pending-email">{inv.email}</span>
                      <span className="pending-role-badge">{inv.role}</span>
                    </div>
                  </div>
                  <div className="pending-actions">
                    <button
                      className="pending-action-btn resend"
                      disabled={actionLoading === `resend-${inv._id}`}
                      onClick={() => handleResend(inv._id, inv.email)}
                    >
                      {actionLoading === `resend-${inv._id}` ? <Loader2 size={14} className="spin-icon" /> : <RefreshCw size={14} />}
                      Resend
                    </button>
                    <button
                      className="pending-action-btn revoke"
                      disabled={actionLoading === `revoke-${inv._id}`}
                      onClick={() => handleRevoke(inv._id, inv.email)}
                    >
                      {actionLoading === `revoke-${inv._id}` ? <Loader2 size={14} className="spin-icon" /> : <Trash2 size={14} />}
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="um-controls">
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="filter-dropdown">
          <Filter className="filter-icon" size={18} />
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
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
                <th>User</th><th>Role</th><th>Status</th><th>Last Login</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ?
                currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <Avatar name={user.name} size="sm" />
                        <div className="user-details">
                          <span className="user-name">{user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                  <td>
                    <select className="inline-role-select" value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </td>
                  <td><span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span></td>
                  <td className="last-login">{user.lastLogin}</td>
                  <td className="actions-col">
                    <div className="action-menu-container">
                      <button className="action-menu-btn"
                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}>
                        <MoreVertical size={18} />
                      </button>
                      {activeMenu === user.id && (
                        <div className="action-dropdown">
                          <button onClick={() => toggleUserStatus(user.id)}>
                            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => setActiveMenu(null)}>Edit</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="empty-state">No users found matching your criteria.</td></tr>
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
            <button className="page-btn" disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
              <ChevronLeft size={16} />
            </button>
            <span className="current-page">{currentPage}</span>
            <button className="page-btn" disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div ref={inviteModalRef} role="dialog" aria-modal="true"
            aria-labelledby="invite-modal-title" tabIndex={-1} className="invite-modal">
            <div className="modal-header">
              <h2 id="invite-modal-title">
                {inviteStep === 'success' ? 'Invitation Sent!' : 'Invite Team Member'}
              </h2>
              <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            {inviteStep === 'success' ? (
              <div className="modal-body invite-success">
                <div className="success-icon"><Mail size={32} /></div>
                <p className="success-message">
                  An invitation has been sent to <strong>{lastInvitedEmail}</strong>.
                  They'll receive an email with a link to create their account.
                </p>
                <div className="modal-footer">
                  <button type="button" className="cancel-btn" onClick={closeModal}>Close</button>
                  <button type="button" className="submit-btn" onClick={() => {
                    setInviteStep('form'); setInviteEmail(''); setInviteMessage(''); setInviteRole('Viewer');
                  }}>Invite Another</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="modal-body">
                <div className="form-group">
                  <label htmlFor="inviteEmail">Email Address *</label>
                  <input type="email" id="inviteEmail" value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="name@company.com" required />
                </div>
                <div className="form-group">
                  <label htmlFor="inviteRole">Role *</label>
                  <select id="inviteRole" value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}>
                    <option value="Admin">Admin — Full access</option>
                    <option value="Manager">Manager — Edit &amp; View</option>
                    <option value="Viewer">Viewer — Read only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="inviteMessage">Personal Message (optional)</label>
                  <textarea id="inviteMessage" value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Add a personal note to the invitation email…" rows={3} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="submit-btn"
                    disabled={!inviteEmail.trim() || actionLoading === 'invite'}>
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
