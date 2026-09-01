import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

// ── Dependency Mocks ──────────────────────────────────────────────────────────

// ThemeToggle (inside TopHeader) calls useTheme which requires ThemeProvider.
// Mock the hook module so the provider is not needed in test renders.
vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ToastContext is consumed by SessionTimeoutModal and NotificationDropdown.
vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn(), removeToast: vi.fn() }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// LiveRegionContext is used by ToastProvider internally via useLiveRegion.
vi.mock('../../context/LiveRegionContext', () => ({
  useLiveRegion: () => ({ announce: vi.fn() }),
  LiveRegionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// realtimeService is consumed by TopHeader (child of DashboardLayout)
vi.mock('../../services/realtime/realtimeService', () => ({
  realtimeService: {
    status: 'connected',
    onStatusChange: vi.fn(() => () => undefined), // returns unsubscribe fn
  },
}));

// authApi + tokenStorage used by SessionTimeoutModal
vi.mock('../../services/api/endpoints/auth', () => ({
  authApi: {
    refresh: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../services/auth/tokenStorage', () => ({
  getToken: vi.fn(() => null), // no token → modal won't open
  clearToken: vi.fn(),
}));

// WalletContext is consumed deep inside TopHeader's WalletPill/WalletModal
vi.mock('../../context/WalletContext', () => ({
  useWallet: () => ({
    isModalOpen: false,
    closeModal: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    publicKey: null,
    isConnecting: false,
    network: 'testnet',
  }),
}));

// shipmentApi is consumed by GlobalSearch inside TopHeader
vi.mock('../../api/shipmentApi', () => ({
  shipmentApi: {
    getAll: vi.fn().mockResolvedValue([]),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Render DashboardLayout inside a MemoryRouter so useNavigate / useLocation work.
 * An <Outlet /> child is provided via a nested route so the layout has content.
 */
function renderLayout(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<main data-testid="outlet-content">Dashboard page</main>} />
          <Route path="/dashboard/shipments" element={<main data-testid="outlet-content">Shipments page</main>} />
          <Route path="/dashboard/settings" element={<main data-testid="outlet-content">Settings page</main>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DashboardLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial render ──────────────────────────────────────────────────────────

  describe('initial render', () => {
    it('renders the NAVIN brand name in the sidebar', () => {
      renderLayout();
      expect(screen.getByText('NAVIN')).toBeInTheDocument();
    });

    it('renders the skip-to-content accessibility link', () => {
      renderLayout();
      expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
    });

    it('renders the main navigation landmark', () => {
      renderLayout();
      expect(screen.getByRole('navigation', { name: /site navigation/i })).toBeInTheDocument();
    });

    it('renders all primary nav items in the sidebar', () => {
      renderLayout();
      const navItems = [
        'Dashboard',
        'Shipments',
        'Shipment History',
        'Blockchain Ledger',
        'Settlements',
        'Payments',
        'Analytics',
        'Notifications',
      ];
      navItems.forEach((label) => {
        // May appear more than once (collapsed/expanded) - just assert at least one
        expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
      });
    });

    it('renders the outlet child content', () => {
      renderLayout('/dashboard');
      expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
      expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    });

    it('highlights the active nav item based on current location', () => {
      renderLayout('/dashboard');
      // The Dashboard button should carry aria-current="page"
      const dashboardButtons = screen.getAllByRole('button', { name: /^Dashboard$/i });
      const activeButton = dashboardButtons.find(
        (btn) => btn.getAttribute('aria-current') === 'page',
      );
      expect(activeButton).toBeTruthy();
    });
  });

  // ── Sidebar collapse ────────────────────────────────────────────────────────

  describe('sidebar collapse / expand', () => {
    it('collapses the sidebar when the collapse button is clicked', async () => {
      const user = userEvent.setup();
      renderLayout();

      const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i });
      await user.click(collapseBtn);

      // After collapse the brand text disappears and expand button appears
      expect(screen.queryByText('NAVIN')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
    });

    it('expands the sidebar when the expand button is clicked after collapsing', async () => {
      const user = userEvent.setup();
      renderLayout();

      await user.click(screen.getByRole('button', { name: /collapse sidebar/i }));
      await user.click(screen.getByRole('button', { name: /expand sidebar/i }));

      expect(screen.getByText('NAVIN')).toBeInTheDocument();
    });
  });

  // ── Nav group accordion ─────────────────────────────────────────────────────

  describe('nav group accordion', () => {
    it('renders the System group header', () => {
      renderLayout();
      expect(screen.getByRole('button', { name: /^System$/i })).toBeInTheDocument();
    });

    it('collapses and re-expands a nav group', async () => {
      const user = userEvent.setup();
      renderLayout();

      const mainMenuBtn = screen.getByRole('button', { name: /^Main Menu$/i });

      // Initially expanded — aria-expanded should be true
      expect(mainMenuBtn).toHaveAttribute('aria-expanded', 'true');

      await user.click(mainMenuBtn);
      expect(mainMenuBtn).toHaveAttribute('aria-expanded', 'false');

      await user.click(mainMenuBtn);
      expect(mainMenuBtn).toHaveAttribute('aria-expanded', 'true');
    });
  });

  // ── Favorites ───────────────────────────────────────────────────────────────

  describe('favorites', () => {
    it('adds a nav item to favorites when the star button is clicked', async () => {
      const user = userEvent.setup();
      renderLayout();

      const starBtn = screen.getByRole('button', {
        name: /add Shipments to dashboard favorites/i,
      });
      await user.click(starBtn);

      // Favorites section should appear
      expect(
        screen.getByRole('navigation', { name: /dashboard favorites/i }),
      ).toBeInTheDocument();
    });

    it('persists favorites to localStorage', async () => {
      const user = userEvent.setup();
      renderLayout();

      const starBtn = screen.getByRole('button', {
        name: /add Shipments to dashboard favorites/i,
      });
      await user.click(starBtn);

      const stored = localStorage.getItem('navin_dashboard_favorites');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toContain('/dashboard/shipments');
    });

    it('removes a nav item from favorites when the star is clicked again', async () => {
      const user = userEvent.setup();
      renderLayout();

      // Add then remove
      const addBtn = screen.getByRole('button', {
        name: /add Shipments to dashboard favorites/i,
      });
      await user.click(addBtn);

      const removeBtn = screen.getByRole('button', {
        name: /remove Shipments from dashboard favorites/i,
      });
      await user.click(removeBtn);

      expect(
        screen.queryByRole('navigation', { name: /dashboard favorites/i }),
      ).not.toBeInTheDocument();
    });

    it('restores favorites from localStorage on mount', () => {
      localStorage.setItem(
        'navin_dashboard_favorites',
        JSON.stringify(['/dashboard/analytics']),
      );
      renderLayout();

      // Favorites section should render immediately without user interaction
      expect(
        screen.getByRole('navigation', { name: /dashboard favorites/i }),
      ).toBeInTheDocument();
      // "Analytics" should appear in the favorites section
      expect(screen.getAllByText('Analytics').length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Mobile sidebar ──────────────────────────────────────────────────────────

  describe('mobile sidebar overlay', () => {
    it('close button is present in the sidebar (mobile)', () => {
      renderLayout();
      expect(screen.getByRole('button', { name: /close sidebar/i })).toBeInTheDocument();
    });

    it('sidebar acts as dialog when open', async () => {
      const user = userEvent.setup();
      renderLayout();

      // Simulate opening on mobile via TopHeader toggle button
      const toggleBtn = screen.getByRole('button', { name: /toggle sidebar/i });
      await user.click(toggleBtn);

      const sidebar = screen.getByRole('dialog', { name: /main navigation/i });
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveAttribute('aria-modal', 'true');
    });

    it('closes the sidebar when the close button is clicked', async () => {
      const user = userEvent.setup();
      renderLayout();

      const toggleBtn = screen.getByRole('button', { name: /toggle sidebar/i });
      await user.click(toggleBtn);

      const closeBtn = screen.getByRole('button', { name: /close sidebar/i });
      await user.click(closeBtn);

      // Sidebar should no longer be in dialog role
      expect(screen.queryByRole('dialog', { name: /main navigation/i })).not.toBeInTheDocument();
    });
  });

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────

  describe('keyboard shortcuts modal', () => {
    it('shows the keyboard shortcuts hint button in the sidebar', () => {
      renderLayout();
      expect(
        screen.getByRole('button', { name: /show keyboard shortcuts/i }),
      ).toBeInTheDocument();
    });

    it('opens the shortcuts help modal when the hint button is clicked', async () => {
      const user = userEvent.setup();
      renderLayout();

      await user.click(screen.getByRole('button', { name: /show keyboard shortcuts/i }));

      // ShortcutsHelpModal renders a dialog with these shortcuts listed
      await waitFor(() => {
        expect(screen.getByText(/Alt \+ D/i)).toBeInTheDocument();
      });
    });
  });

  // ── Node status widget ──────────────────────────────────────────────────────

  describe('enterprise node status widget', () => {
    it('renders the enterprise node status text when sidebar is expanded', () => {
      renderLayout();
      expect(screen.getByText('Enterprise Node')).toBeInTheDocument();
    });

    it('shows syncing status', () => {
      renderLayout();
      expect(screen.getByText(/Syncing/)).toBeInTheDocument();
    });
  });
});
