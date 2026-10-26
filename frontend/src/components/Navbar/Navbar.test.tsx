import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import * as useScrollSpyModule from '../../hooks/useScrollSpy';

// Mock the useScrollSpy hook
vi.mock('../../hooks/useScrollSpy', () => ({
  useScrollSpy: vi.fn(),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        appName: 'Navin',
        home: 'Home',
        whyNavin: 'Why Navin',
        features: 'Features',
        howItWorks: 'How It Works',
        faq: 'FAQ',
        login: 'Login',
        freeDemo: 'Free Demo',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock LanguageSelect component
vi.mock('@components/common/LanguageSelect', () => ({
  default: ({ compact, variant }: { compact?: boolean; variant?: string }) => (
    <div data-testid="language-select" data-compact={compact} data-variant={variant}>
      Language Select
    </div>
  ),
}));

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(useScrollSpyModule.useScrollSpy).mockReturnValue(null);
  });

  describe('Basic rendering', () => {
    it('renders the navbar', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renders the logo', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      expect(screen.getByAltText('Navin Logo')).toBeInTheDocument();
      expect(screen.getByText('Navin')).toBeInTheDocument();
    });

    it('renders company logo when stored in localStorage', () => {
      localStorage.setItem('navin-company-logo', 'https://example.com/logo.png');

      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const companyLogo = screen.getByAltText('Company logo');
      expect(companyLogo).toBeInTheDocument();
      expect(companyLogo).toHaveAttribute('src', 'https://example.com/logo.png');
    });

    it('renders default logo when no company logo is stored', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      expect(screen.getByAltText('Navin Logo')).toBeInTheDocument();
      expect(screen.queryByAltText('Company logo')).not.toBeInTheDocument();
    });
  });

  describe('Navigation links', () => {
    it('renders all navigation links on landing page', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar />
        </MemoryRouter>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Why Navin')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText('FAQ')).toBeInTheDocument();
    });

    it('renders correct href attributes for navigation links', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar />
        </MemoryRouter>
      );

      expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '#home');
      expect(screen.getByText('Why Navin').closest('a')).toHaveAttribute('href', '#why-navin');
      expect(screen.getByText('Features').closest('a')).toHaveAttribute('href', '#features');
      expect(screen.getByText('How It Works').closest('a')).toHaveAttribute('href', '#how-it-works');
      expect(screen.getByText('FAQ').closest('a')).toHaveAttribute('href', '#faq');
    });

    it('calls scroll into view when clicking nav link on landing page', async () => {
      const user = userEvent.setup();
      const mockScrollIntoView = vi.fn();

      // Mock getElementById to return an element with scrollIntoView
      const mockElement = {
        scrollIntoView: mockScrollIntoView,
      } as unknown as HTMLElement;
      vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

      render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar />
        </MemoryRouter>
      );

      const featuresLink = screen.getByText('Features');
      await user.click(featuresLink);

      expect(document.getElementById).toHaveBeenCalledWith('features');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('does not scroll on non-landing pages', async () => {
      const user = userEvent.setup();
      const mockScrollIntoView = vi.fn();

      const mockElement = {
        scrollIntoView: mockScrollIntoView,
      } as unknown as HTMLElement;
      vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Navbar />
        </MemoryRouter>
      );

      const homeLink = screen.getByText('Home');
      await user.click(homeLink);

      // Should not call scrollIntoView when not on landing page
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    it('highlights active section with aria-current', () => {
      vi.mocked(useScrollSpyModule.useScrollSpy).mockReturnValue('features');

      render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar />
        </MemoryRouter>
      );

      const featuresLink = screen.getByText('Features').closest('a');
      expect(featuresLink).toHaveAttribute('aria-current', 'true');
    });

    it('does not set aria-current on inactive sections', () => {
      vi.mocked(useScrollSpyModule.useScrollSpy).mockReturnValue('features');

      render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar />
        </MemoryRouter>
      );

      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).not.toHaveAttribute('aria-current');
    });

    it('applies active styling to current section', () => {
      vi.mocked(useScrollSpyModule.useScrollSpy).mockReturnValue('how-it-works');

      render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar />
        </MemoryRouter>
      );

      const howItWorksLink = screen.getByText('How It Works').closest('a');
      expect(howItWorksLink).toHaveClass('!text-[#00d4c8]');
    });
  });

  describe('Authentication links', () => {
    it('renders login link', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const loginLink = screen.getByRole('link', { name: /login/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('renders signup/demo link', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const signupLink = screen.getByRole('link', { name: /free demo/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });

  describe('Language selector', () => {
    it('renders language select in desktop view', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const languageSelects = screen.getAllByTestId('language-select');
      expect(languageSelects.length).toBeGreaterThan(0);
    });

    it('renders compact language select for mobile', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const compactSelect = screen.getAllByTestId('language-select').find(
        (select) => select.getAttribute('data-compact') === 'true'
      );
      expect(compactSelect).toBeInTheDocument();
    });

    it('renders navbar variant language select', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const navbarSelects = screen.getAllByTestId('language-select').filter(
        (select) => select.getAttribute('data-variant') === 'navbar'
      );
      expect(navbarSelects.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive behavior', () => {
    it('renders compact language selector for narrow screens', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const compactLanguageSelect = screen.getAllByTestId('language-select').find(
        (el) => el.getAttribute('data-compact') === 'true'
      );
      expect(compactLanguageSelect).toBeInTheDocument();
    });

    it('hides desktop menu on mobile viewports', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      // The desktop menu has class "hidden xl:flex"
      const desktopMenu = screen.getByText('Login').closest('div')?.parentElement;
      expect(desktopMenu).toHaveClass('hidden', 'xl:flex');
    });

    it('hides compact language select on desktop', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const compactSelectContainer = screen.getAllByTestId('language-select').find(
        (el) => el.getAttribute('data-compact') === 'true'
      )?.parentElement;
      expect(compactSelectContainer).toHaveClass('flex', 'xl:hidden');
    });
  });

  describe('Logo link', () => {
    it('links to home page', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const logoLink = screen.getByText('Navin').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('logo is clickable', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const logoLink = screen.getByText('Navin').closest('a');
      expect(logoLink).toBeInTheDocument();

      await user.click(logoLink!);
      // Link navigation is handled by react-router, no assertion needed
    });
  });

  describe('Accessibility', () => {
    it('has proper navigation landmark', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('has descriptive alt text for logo', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      expect(screen.getByAltText('Navin Logo')).toBeInTheDocument();
    });

    it('has descriptive alt text for company logo', () => {
      localStorage.setItem('navin-company-logo', 'https://example.com/logo.png');

      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      expect(screen.getByAltText('Company logo')).toBeInTheDocument();
    });
  });

  describe('useScrollSpy integration', () => {
    it('calls useScrollSpy with section IDs on landing page', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar />
        </MemoryRouter>
      );

      expect(useScrollSpyModule.useScrollSpy).toHaveBeenCalledWith([
        'home',
        'why-navin',
        'features',
        'how-it-works',
        'faq',
      ]);
    });

    it('calls useScrollSpy with empty array on non-landing pages', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Navbar />
        </MemoryRouter>
      );

      expect(useScrollSpyModule.useScrollSpy).toHaveBeenCalledWith([]);
    });

    it('updates active section when scrolling', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar />
        </MemoryRouter>
      );

      // Initially no active section
      expect(screen.getByText('Home').closest('a')).not.toHaveAttribute('aria-current');

      // Simulate scroll spy returning 'home'
      vi.mocked(useScrollSpyModule.useScrollSpy).mockReturnValue('home');

      rerender(
        <MemoryRouter initialEntries={['/']}>
          <Navbar />
        </MemoryRouter>
      );

      expect(screen.getByText('Home').closest('a')).toHaveAttribute('aria-current', 'true');
    });
  });
});
