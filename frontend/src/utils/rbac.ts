export type UserRole = 'company' | 'customer';

/** The roles this frontend knows how to route and authorise. */
export const USER_ROLES: readonly UserRole[] = ['company', 'customer'];

/**
 * Narrows an untrusted value to a `UserRole`.
 *
 * Returns `null` for anything the frontend cannot act on. That includes case
 * variants the backend may send (`'COMPANY'`), which are normalised rather
 * than rejected, and the empty string. An unrecognised role must never reach
 * `PERMISSIONS`: a missing key there throws out of `can()` instead of denying.
 */
export function toUserRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') return null;
  const normalised = value.trim().toLowerCase();
  return USER_ROLES.find((role) => role === normalised) ?? null;
}

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
