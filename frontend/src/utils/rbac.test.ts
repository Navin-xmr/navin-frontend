import { describe, it, expect } from 'vitest';
import { can, toUserRole, USER_ROLES } from './rbac';

describe('rbac.can()', () => {
  describe('company role', () => {
    it('can create shipments', () => expect(can('company', 'shipment:create')).toBe(true));
    it('can upload proof', () => expect(can('company', 'shipment:upload-proof')).toBe(true));
    it('can confirm milestones', () => expect(can('company', 'shipment:confirm-milestone')).toBe(true));
    it('can release payments', () => expect(can('company', 'settlement:release-payment')).toBe(true));
    it('can dispute settlements', () => expect(can('company', 'settlement:dispute')).toBe(true));
    it('can manage team', () => expect(can('company', 'user:manage-team')).toBe(true));
    it('can view analytics', () => expect(can('company', 'analytics:view')).toBe(true));
    it('can manage api keys', () => expect(can('company', 'api-keys:manage')).toBe(true));
  });

  describe('customer role', () => {
    it('cannot create shipments', () => expect(can('customer', 'shipment:create')).toBe(false));
    it('cannot upload proof', () => expect(can('customer', 'shipment:upload-proof')).toBe(false));
    it('cannot release payments', () => expect(can('customer', 'settlement:release-payment')).toBe(false));
    it('cannot dispute settlements', () => expect(can('customer', 'settlement:dispute')).toBe(false));
    it('cannot manage api keys', () => expect(can('customer', 'api-keys:manage')).toBe(false));
  });

  describe('null role', () => {
    it('returns false for any action', () => expect(can(null, 'shipment:create')).toBe(false));
  });
});

describe('rbac.toUserRole()', () => {
  it('accepts the roles the frontend knows', () => {
    expect(toUserRole('company')).toBe('company');
    expect(toUserRole('customer')).toBe('customer');
  });

  it('normalises case and surrounding whitespace', () => {
    expect(toUserRole('COMPANY')).toBe('company');
    expect(toUserRole(' Customer ')).toBe('customer');
  });

  it('rejects anything that is not a known role', () => {
    // The case in #820: a token claiming a role this build cannot route.
    expect(toUserRole('admin')).toBeNull();
    expect(toUserRole('driver')).toBeNull();
    expect(toUserRole('')).toBeNull();
    expect(toUserRole(null)).toBeNull();
    expect(toUserRole(undefined)).toBeNull();
    expect(toUserRole(7)).toBeNull();
    expect(toUserRole({ role: 'company' })).toBeNull();
  });

  it('exposes the roles it validates against', () => {
    expect([...USER_ROLES]).toEqual(['company', 'customer']);
  });
});
