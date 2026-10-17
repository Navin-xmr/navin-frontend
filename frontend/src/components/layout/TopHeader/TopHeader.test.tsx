import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TopHeader from './TopHeader';

const { navigateMock, statusListenerMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  statusListenerMock: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('../../../services/realtime/realtimeService', () => ({
  realtimeService: {
    status: 'connected',
    onStatusChange: (listener: unknown) => {
      statusListenerMock(listener);
      return vi.fn();
    },
  },
}));

vi.mock('../../notifications/NotificationDropdown/NotificationDropdown', () => ({
  NotificationDropdown: () => <button type="button">Notifications</button>,
}));
vi.mock('../../ThemeToggle/ThemeToggle', () => ({ default: () => <button type="button">Theme</button> }));
vi.mock('@components/ui/ConnectionStatusDot', () => ({ default: () => <span>Connected</span> }));
vi.mock('../../wallet/WalletPill', () => ({ default: () => <span>Wallet</span> }));
vi.mock('../../wallet/NetworkBadge', () => ({ default: () => <span>Network</span> }));
vi.mock('../../wallet/WalletModal', () => ({ default: () => null }));
vi.mock('@components/ui/Tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('../../common/GlobalSearch/GlobalSearch', () => ({
  default: ({ placeholder }: { placeholder: string }) => <input aria-label="Global search" placeholder={placeholder} />,
}));

describe('TopHeader', () => {
  it('renders the header title area and header actions', () => {
    render(<TopHeader toggleSidebar={vi.fn()} />);

    expect(screen.getByPlaceholderText('Search shipments… (Ctrl+K)')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('Wallet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View profile' })).toBeInTheDocument();
    expect(statusListenerMock).toHaveBeenCalledOnce();
  });

  it('calls the sidebar toggle action and navigates to the profile menu', async () => {
    const toggleSidebar = vi.fn();
    render(<TopHeader toggleSidebar={toggleSidebar} />);

    await userEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }));
    await userEvent.click(screen.getByRole('button', { name: 'View profile' }));

    expect(toggleSidebar).toHaveBeenCalledOnce();
    expect(navigateMock).toHaveBeenCalledWith('/dashboard/profile');
  });
});
