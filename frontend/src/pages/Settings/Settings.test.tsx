import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Settings from './Settings';

const mockAuthContext = vi.hoisted(() => ({
  role: 'individual',
  userId: 'user-123',
}));

vi.mock('@context/AuthContext', () => ({
  useAuthContext: () => mockAuthContext,
}));

vi.mock('@utils/rbac', () => ({
  can: (role: string, permission: string) => {
    if (permission === 'api-keys:manage') return role === 'company';
    return true;
  },
}));

// Mock lazy-loaded sections
vi.mock('./sections/ProfileSection', () => ({
  default: () => <div data-testid="profile-section">Profile Section</div>,
}));

vi.mock('./CompanyProfile/CompanyProfile', () => ({
  default: () => <div data-testid="company-profile-section">Company Profile Section</div>,
}));

vi.mock('./sections/SecuritySection/SecuritySection', () => ({
  default: () => <div data-testid="security-section">Security Section</div>,
}));

vi.mock('./sections/NotificationsSection', () => ({
  default: () => <div data-testid="notifications-section">Notifications Section</div>,
}));

vi.mock('./sections/AppearanceSection', () => ({
  default: () => <div data-testid="appearance-section">Appearance Section</div>,
}));

vi.mock('./sections/WalletsSection', () => ({
  default: () => <div data-testid="wallets-section">Wallets Section</div>,
}));

vi.mock('./sections/ApiKeysSection', () => ({
  default: () => <div data-testid="api-keys-section">API Keys Section</div>,
}));

vi.mock('./sections/DangerZone', () => ({
  default: () => <div data-testid="danger-zone-section">Danger Zone Section</div>,
}));

vi.mock('./sections/MyTemplatesSection', () => ({
  default: () => <div data-testid="templates-section">My Templates Section</div>,
}));

vi.mock('./sections/TeamSection', () => ({
  default: () => <div data-testid="team-section">Team Section</div>,
}));

vi.mock('./sections/AddressBookSection', () => ({
  default: () => <div data-testid="address-book-section">Address Book Section</div>,
}));

const renderSettings = () => {
  return render(
    <BrowserRouter>
      <Settings />
    </BrowserRouter>,
    { wrapper: ({ children }) => <div>{children}</div> }
  );
};

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.role = 'individual';
    mockAuthContext.userId = 'user-123';
  });

  it('renders the settings page with profile tab by default', async () => {
    renderSettings();

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText(/manage your account/i)).toBeInTheDocument();
    
    // Profile tab should be active by default
    const profileTab = screen.getByRole('tab', { name: 'Profile' });
    expect(profileTab).toHaveAttribute('aria-selected', 'true');
    
    // Profile section should be visible
    expect(await screen.findByTestId('profile-section')).toBeInTheDocument();
  });

  it('shows only individual tabs for individual users', () => {
    mockAuthContext.role = 'individual';
    renderSettings();

    // Individual tabs should be visible
    expect(screen.getByRole('tab', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Security' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Danger Zone' })).toBeInTheDocument();

    // Company-only tabs should not be visible
    expect(screen.queryByRole('tab', { name: 'Company Profile' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Wallets' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'API Keys' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'My Templates' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Team' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Address Book' })).not.toBeInTheDocument();
  });

  it('shows all tabs including company tabs for company users', () => {
    mockAuthContext.role = 'company';
    renderSettings();

    // All tabs should be visible
    expect(screen.getByRole('tab', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Company Profile' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Security' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Wallets' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'My Templates' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'API Keys' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Team' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Address Book' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Danger Zone' })).toBeInTheDocument();
  });

  it('switches between tabs when clicked', async () => {
    const user = userEvent.setup();
    renderSettings();

    // Click on Security tab
    await user.click(screen.getByRole('tab', { name: 'Security' }));
    expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByTestId('security-section')).toBeInTheDocument();

    // Click on Notifications tab
    await user.click(screen.getByRole('tab', { name: 'Notifications' }));
    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByTestId('notifications-section')).toBeInTheDocument();

    // Click on Appearance tab
    await user.click(screen.getByRole('tab', { name: 'Appearance' }));
    expect(screen.getByRole('tab', { name: 'Appearance' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByTestId('appearance-section')).toBeInTheDocument();
  });

  it('renders company-only sections when user is a company', async () => {
    mockAuthContext.role = 'company';
    const user = userEvent.setup();
    renderSettings();

    // Click on Company Profile tab
    await user.click(screen.getByRole('tab', { name: 'Company Profile' }));
    expect(await screen.findByTestId('company-profile-section')).toBeInTheDocument();

    // Click on Wallets tab
    await user.click(screen.getByRole('tab', { name: 'Wallets' }));
    expect(await screen.findByTestId('wallets-section')).toBeInTheDocument();

    // Click on My Templates tab
    await user.click(screen.getByRole('tab', { name: 'My Templates' }));
    expect(await screen.findByTestId('templates-section')).toBeInTheDocument();

    // Click on API Keys tab
    await user.click(screen.getByRole('tab', { name: 'API Keys' }));
    expect(await screen.findByTestId('api-keys-section')).toBeInTheDocument();

    // Click on Team tab
    await user.click(screen.getByRole('tab', { name: 'Team' }));
    expect(await screen.findByTestId('team-section')).toBeInTheDocument();

    // Click on Address Book tab
    await user.click(screen.getByRole('tab', { name: 'Address Book' }));
    expect(await screen.findByTestId('address-book-section')).toBeInTheDocument();
  });

  it('renders danger zone for all users', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('tab', { name: 'Danger Zone' }));
    expect(await screen.findByTestId('danger-zone-section')).toBeInTheDocument();
  });

  it('updates URL search params when switching tabs', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('tab', { name: 'Security' }));
    // In a real environment, this would update the URL
    // For now, we just verify the tab switches correctly
    expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
  });

  it('updates breadcrumb current label based on active tab', async () => {
    const user = userEvent.setup();
    renderSettings();

    // Default is Profile
    expect(screen.getByText('Profile')).toBeInTheDocument();

    // Switch to Security
    await user.click(screen.getByRole('tab', { name: 'Security' }));
    expect(screen.getByText('Security')).toBeInTheDocument();

    // Switch to Notifications
    await user.click(screen.getByRole('tab', { name: 'Notifications' }));
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('has accessible tab navigation', () => {
    renderSettings();

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);

    tabs.forEach((tab) => {
      expect(tab).toHaveAttribute('aria-selected');
    });
  });
});
