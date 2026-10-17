import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RoleAccessInfo from './RoleAccessInfo';

describe('RoleAccessInfo', () => {
  it.each([
    ['Company Account', 'Create shipments'],
    ['Admin', 'Manage users'],
    ['Dispatcher', 'Assign deliveries'],
  ])('explains that %s users can %s', (requiredRole, action) => {
    render(<RoleAccessInfo hasAccess={false} action={action} requiredRole={requiredRole} />);

    expect(screen.getByRole('heading', { name: 'Limited Access' })).toBeInTheDocument();
    expect(screen.getByText(action, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(requiredRole, { exact: false })).toBeInTheDocument();
  });

  it('includes the current user role when provided', () => {
    render(
      <RoleAccessInfo
        hasAccess={false}
        action="View settlements"
        requiredRole="Finance Admin"
        userRole="Viewer"
      />,
    );

    expect(screen.getByText(/currently logged in as a Viewer/i)).toBeInTheDocument();
  });

  it('renders children instead of the access message when access is granted', () => {
    render(
      <RoleAccessInfo hasAccess action="View settlements">
        <span>Protected content</span>
      </RoleAccessInfo>,
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Limited Access' })).not.toBeInTheDocument();
  });
});
