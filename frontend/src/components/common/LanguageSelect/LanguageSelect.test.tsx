import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { LanguageSelect } from './LanguageSelect';
import * as useLanguageModule from '@hooks/useLanguage';

// Mock the useLanguage hook
vi.mock('@hooks/useLanguage', () => ({
  useLanguage: vi.fn(),
  SUPPORTED_LANGUAGES: [
    { code: 'en', label: 'English', shortLabel: 'EN' },
    { code: 'fr', label: 'Français', shortLabel: 'FR' },
    { code: 'es', label: 'Español', shortLabel: 'ES' },
  ],
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('LanguageSelect', () => {
  const mockChangeLanguage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default mock implementation
    vi.mocked(useLanguageModule.useLanguage).mockReturnValue({
      language: 'en',
      changeLanguage: mockChangeLanguage,
      supportedLanguages: [
        { code: 'en', label: 'English', shortLabel: 'EN' },
        { code: 'fr', label: 'Français', shortLabel: 'FR' },
        { code: 'es', label: 'Español', shortLabel: 'ES' },
      ],
    });
  });

  it('renders with default variant', () => {
    render(<LanguageSelect />);
    const select = screen.getByRole('combobox', { name: /language/i });
    expect(select).toBeInTheDocument();
  });

  it('renders with navbar variant', () => {
    render(<LanguageSelect variant="navbar" />);
    const select = screen.getByRole('combobox', { name: /language/i });
    expect(select).toHaveClass('bg-gradient-card');
  });

  it('renders all supported languages', () => {
    render(<LanguageSelect />);
    expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /français/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /español/i })).toBeInTheDocument();
  });

  it('shows full labels when compact is false', () => {
    render(<LanguageSelect compact={false} />);
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Français' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Español' })).toBeInTheDocument();
  });

  it('shows short labels when compact is true', () => {
    render(<LanguageSelect compact />);
    expect(screen.getByRole('option', { name: 'EN' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'FR' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'ES' })).toBeInTheDocument();
  });

  it('displays current language as selected', () => {
    vi.mocked(useLanguageModule.useLanguage).mockReturnValue({
      language: 'fr',
      changeLanguage: mockChangeLanguage,
      supportedLanguages: [
        { code: 'en', label: 'English', shortLabel: 'EN' },
        { code: 'fr', label: 'Français', shortLabel: 'FR' },
        { code: 'es', label: 'Español', shortLabel: 'ES' },
      ],
    });

    render(<LanguageSelect />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('fr');
  });

  it('handles language change', async () => {
    const user = userEvent.setup();
    render(<LanguageSelect />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'fr');

    expect(mockChangeLanguage).toHaveBeenCalledWith('fr');
  });

  it('changes to Spanish language', async () => {
    const user = userEvent.setup();
    render(<LanguageSelect />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'es');

    expect(mockChangeLanguage).toHaveBeenCalledWith('es');
  });

  it('persists language choice to localStorage', async () => {
    const realChangeLanguage = async (lang: string) => {
      // Simulate the real useLanguage behavior
      localStorage.setItem('language', lang);
    };

    vi.mocked(useLanguageModule.useLanguage).mockReturnValue({
      language: 'en',
      changeLanguage: realChangeLanguage,
      supportedLanguages: [
        { code: 'en', label: 'English', shortLabel: 'EN' },
        { code: 'fr', label: 'Français', shortLabel: 'FR' },
        { code: 'es', label: 'Español', shortLabel: 'ES' },
      ],
    });

    const user = userEvent.setup();
    render(<LanguageSelect />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'fr');

    expect(localStorage.getItem('language')).toBe('fr');
  });

  it('applies custom className', () => {
    render(<LanguageSelect className="custom-class" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('uses custom aria-label when provided', () => {
    render(<LanguageSelect aria-label="Choose language" />);
    expect(screen.getByRole('combobox', { name: 'Choose language' })).toBeInTheDocument();
  });

  it('handles language codes with region (e.g., en-US)', () => {
    vi.mocked(useLanguageModule.useLanguage).mockReturnValue({
      language: 'en-US',
      changeLanguage: mockChangeLanguage,
      supportedLanguages: [
        { code: 'en', label: 'English', shortLabel: 'EN' },
        { code: 'fr', label: 'Français', shortLabel: 'FR' },
        { code: 'es', label: 'Español', shortLabel: 'ES' },
      ],
    });

    render(<LanguageSelect />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('en');
  });

  it('applies navbar-specific styles in navbar variant', () => {
    render(<LanguageSelect variant="navbar" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('bg-gradient-card', 'backdrop-blur-md', 'text-white');
  });

  it('applies default-specific styles in default variant', () => {
    render(<LanguageSelect variant="default" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('bg-white', 'dark:bg-[#0B0E14]');
  });

  it('applies compact styles when compact is true', () => {
    render(<LanguageSelect compact variant="navbar" />);
    const select = screen.getByRole('combobox');
    expect(select.className).toContain('pl-3 pr-7 py-1.5 text-xs');
  });
});
