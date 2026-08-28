import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SecuritySection from './SecuritySection';

vi.mock('./ChangePasswordForm', () => ({
  default: () => <div>ChangePasswordForm</div>,
}));
vi.mock('./TwoFactorSetup', () => ({
  default: () => <div>TwoFactorSetup</div>,
}));
vi.mock('./SessionList', () => ({
  default: () => <div>SessionList</div>,
}));

describe('SecuritySection', () => {
  it('renders the heading and composes the password, 2FA, and session sections', () => {
    render(<SecuritySection />);

    expect(screen.getByRole('heading', { name: 'Security' })).toBeInTheDocument();
    expect(screen.getByText('ChangePasswordForm')).toBeInTheDocument();
    expect(screen.getByText('TwoFactorSetup')).toBeInTheDocument();
    expect(screen.getByText('SessionList')).toBeInTheDocument();
  });
});
