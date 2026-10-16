import type { UserRole } from '@services/api/endpoints/users';

export type TeamMemberStatus = 'Active' | 'Invited' | 'Deactivated';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: TeamMemberStatus;
  lastActive?: string;
  source: 'user' | 'invitation';
  invitationId?: string;
}

export interface RoleInfo {
  description: string;
  permissions: string[];
  limitations: string[];
}

export interface ConfirmAction {
  member: TeamMember;
  type: 'deactivate' | 'activate' | 'resend';
}

export const ROLES: UserRole[] = ['Admin', 'Manager', 'Viewer', 'Driver'];

export const ROLE_INFO: Record<UserRole, RoleInfo> = {
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

export const STATUS_COLORS: Record<TeamMemberStatus, string> = {
  Active: 'text-green-400 bg-green-500/10 border-green-500/30',
  Invited: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Deactivated: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

export const ALL_ROLES_FILTER = 'All Roles';
export const ALL_STATUSES_FILTER = 'All Statuses';
