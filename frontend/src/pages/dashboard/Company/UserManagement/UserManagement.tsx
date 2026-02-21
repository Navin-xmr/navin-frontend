import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, MoreVertical, X } from 'lucide-react';
import './UserManagement.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice Smith', email: 'alice@navin.com', role: 'Admin', status: 'Active', lastLogin: '2023-10-25 09:30 AM' },
  { id: '2', name: 'Bob Johnson', email: 'bob@navin.com', role: 'Manager', status: 'Active', lastLogin: '2023-10-24 14:15 PM' },
  { id: '3', name: 'Charlie Williams', email: 'charlie@navin.com', role: 'Viewer', status: 'Inactive', lastLogin: '2023-10-10 11:20 AM' },
  { id: '4', name: 'Diana King', email: 'diana@navin.com', role: 'Manager', status: 'Active', lastLogin: '2023-10-25 08:45 AM' },
  { id: '5', name: 'Edward Brown', email: 'edward@navin.com', role: 'Viewer', status: 'Active', lastLogin: '2023-10-22 16:30 PM' },
  { id: '6', name: 'Fiona Davis', email: 'fiona@navin.com', role: 'Viewer', status: 'Inactive', lastLogin: '2023-09-15 10:05 AM' },
  { id: '7', name: 'George Miller', email: 'george@navin.com', role: 'Manager', status: 'Active', lastLogin: '2023-10-23 13:40 PM' },
  { id: '8', name: 'Hannah Wilson', email: 'hannah@navin.com', role: 'Viewer', status: 'Active', lastLogin: '2023-10-25 10:00 AM' },
  { id: '9', name: 'Ian Moore', email: 'ian@navin.com', role: 'Viewer', status: 'Inactive', lastLogin: '2023-08-30 09:15 AM' },
  { id: '10', name: 'Julia Taylor', email: 'julia@navin.com', role: 'Admin', status: 'Active', lastLogin: '2023-10-25 07:50 AM' },
  { id: '11', name: 'Kevin Anderson', email: 'kevin@navin.com', role: 'Viewer', status: 'Active', lastLogin: '2023-10-21 15:20 PM' },
  { id: '12', name: 'Laura Thomas', email: 'laura@navin.com', role: 'Manager', status: 'Active', lastLogin: '2023-10-24 11:10 AM' },
];

type ActionMenuState = string | null;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActionMenuState>(null);
  
  // Modal Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Manager' | 'Viewer'>('Viewer');

  const itemsPerPage = 8;

  // Filter & Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleRoleChange = (id: string, newRole: 'Admin' | 'Manager' | 'Viewer') => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    setActiveMenu(null);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id 
        ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } 
        : u
    ));
    setActiveMenu(null);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: inviteEmail.split('@')[0], // Mock name from email
      email: inviteEmail,
      role: inviteRole,
      status: 'Active',
      lastLogin: 'Never',
    };

    setUsers([newUser, ...users]);
    setInviteEmail('');
    setInviteRole('Viewer');
    setIsModalOpen(false);
  };

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
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'Admin' | 'Manager' | 'Viewer')}
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
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
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

      {/* Invite Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="invite-modal">
            <div className="modal-header">
              <h2>Invite New User</h2>
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
                  onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Manager' | 'Viewer')}
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
                <button type="submit" className="submit-btn" disabled={!inviteEmail.trim()}>
                  Send Invite
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
