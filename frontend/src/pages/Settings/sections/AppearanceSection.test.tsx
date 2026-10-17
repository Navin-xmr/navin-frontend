import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppearanceSection from './AppearanceSection';

const mockTheme = vi.hoisted(() => ({
  theme: 'dark' as 'light' | 'dark',
  toggleTheme: vi.fn(),
}));

const mockTranslation = vi.hoisted(() => ({
  t: (key: string, defaultValue?: string) => defaultValue || key,
  i18n: {
    changeLanguage: vi.fn(),
    language: 'en',
  },
}));

vi.mock('@hooks/useTheme', () => ({
  useTheme: () => mockTheme,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => mockTranslation,
}));

vi.mock('@components/common/LanguageSelect', () => ({
  default: () => <div data-testid="language-select">Language Select</div>,
}));

describe('AppearanceSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme.theme = 'dark';
    delete (window as { location?: unknown }).location;
    window.location = { reload: vi.fn() } as unknown as Location;
  });

  it('renders appearance section with theme options', () => {
    render(<AppearanceSection />);

    expect(screen.getByRole('heading', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByText('Color Theme')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('shows dark theme as selected when theme is dark', () => {
    mockTheme.theme = 'dark';
    render(<AppearanceSection />);

    const darkButton = screen.getByRole('button', { name: /dark/i, pressed: true });
    expect(darkButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows light theme as selected when theme is light', () => {
    mockTheme.theme = 'light';
    render(<AppearanceSection />);

    const lightButton = screen.getByRole('button', { name: /light/i, pressed: true });
    expect(lightButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles to light theme when light button is clicked', async () => {
    const user = userEvent.setup();
    mockTheme.theme = 'dark';
    render(<AppearanceSection />);

    const lightButton = screen.getByRole('button', { name: /light/i });
    await user.click(lightButton);

    expect(mockTheme.toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('toggles to dark theme when dark button is clicked', async () => {
    const user = userEvent.setup();
    mockTheme.theme = 'light';
    render(<AppearanceSection />);

    const darkButton = screen.getByRole('button', { name: /dark/i });
    await user.click(darkButton);

    expect(mockTheme.toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('does not toggle theme when clicking already active theme', async () => {
    const user = userEvent.setup();
    mockTheme.theme = 'dark';
    render(<AppearanceSection />);

    const darkButton = screen.getByRole('button', { name: /dark/i });
    await user.click(darkButton);

    expect(mockTheme.toggleTheme).not.toHaveBeenCalled();
  });

  it('removes theme preference and reloads when system button is clicked', async () => {
    const user = userEvent.setup();
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    render(<AppearanceSection />);

    const systemButton = screen.getByRole('button', { name: /system/i });
    await user.click(systemButton);

    expect(removeItemSpy).toHaveBeenCalledWith('navin-theme');
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('renders language section', () => {
    render(<AppearanceSection />);

    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByTestId('language-select')).toBeInTheDocument();
  });

  it('shows persistence information for both sections', () => {
    render(<AppearanceSection />);

    const persistenceMessages = screen.getAllByText(/preference is saved locally/i);
    expect(persistenceMessages).toHaveLength(2); // One for theme, one for language
  });

  it('has proper accessibility attributes for theme buttons', () => {
    render(<AppearanceSection />);

    const lightButton = screen.getByRole('button', { name: /light/i });
    const darkButton = screen.getByRole('button', { name: /dark/i });
    const systemButton = screen.getByRole('button', { name: /system/i });

    expect(lightButton).toHaveAttribute('aria-pressed');
    expect(darkButton).toHaveAttribute('aria-pressed');
    expect(systemButton).toHaveAttribute('title', 'Use system preference');
  });

  it('renders with proper styling classes for active theme', () => {
    mockTheme.theme = 'dark';
    render(<AppearanceSection />);

    const darkButton = screen.getByRole('button', { name: /dark/i });
    expect(darkButton).toHaveClass(/border-teal-500|border-\[#62ffff\]/);
  });

  it('renders icons for each theme option', () => {
    render(<AppearanceSection />);

    // Check that all theme options have their containers
    expect(screen.getByText('Light').previousElementSibling).toBeInTheDocument(); // Sun icon
    expect(screen.getByText('Dark').previousElementSibling).toBeInTheDocument(); // Moon icon
    expect(screen.getByText('System').previousElementSibling).toBeInTheDocument(); // Monitor icon
  });

  it('displays language section with globe icon', () => {
    render(<AppearanceSection />);

    const languageHeading = screen.getByText('Language');
    expect(languageHeading.parentElement?.querySelector('svg')).toBeInTheDocument();
  });
});
