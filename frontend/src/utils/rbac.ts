export type UserRole = 'company' | 'customer';

export type Action =
  | 'shipment:create'
  | 'shipment:upload-proof'
  | 'shipment:confirm-milestone'
  | 'settlement:release-payment'
  | 'settlement:dispute'
  | 'user:manage-team'
  | 'analytics:view'
  | 'api-keys:manage';

const PERMISSIONS: Record<UserRole, Action[]> = {
  company: [
    'shipment:create',
    'shipment:upload-proof',
    'shipment:confirm-milestone',
    'settlement:release-payment',
    'settlement:dispute',
    'user:manage-team',
    'analytics:view',
    'api-keys:manage',
  ],
  customer: [],
};

export function can(role: UserRole | null, action: Action): boolean {
  if (!role) return false;
  return PERMISSIONS[role].includes(action);
}
