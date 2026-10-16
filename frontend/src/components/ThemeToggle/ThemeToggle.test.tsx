import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '../../hooks/useTheme';

const STORAGE_KEY = 'navin-theme';

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const renderWithThemeProvider = (initialTheme?: 'light' | 'dark' | null) => {
  if (initialTheme) {
    localStorage.setItem(STORAGE_KEY, initialTheme);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }

  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    mockMatchMedia(false); // Default to light system preference
  });

  describe('Basic rendering', () => {
    it('renders the theme toggle button', () => {
      renderWithThemeProvider('light');

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has accessible label for light theme', () => {
      renderWithThemeProvider('light');

      const button = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(button).toBeInTheDocument();
    });

    it('has accessible label for dark theme', () => {
      renderWithThemeProvider('dark');

      const button = screen.getByRole('button', { name: /switch to light mode/i });
      expect(button).toBeInTheDocument();
    });

    it('has title attribute for light theme', () => {
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');
    });

    it('has title attribute for dark theme', () => {
      renderWithThemeProvider('dark');

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to light mode');
    });
  });

  describe('Icon rendering', () => {
    it('shows moon icon when in light mode', () => {
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');
      // Moon icon is rendered when theme is light
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('shows sun icon when in dark mode', () => {
      renderWithThemeProvider('dark');

      const button = screen.getByRole('button');
      // Sun icon is rendered when theme is dark
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Theme toggling', () => {
    it('toggles from light to dark theme', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider('light');

      const button = screen.getByRole('button', { name: /switch to dark mode/i });
      await user.click(button);

      // After toggle, should show "switch to light mode"
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    });

    it('toggles from dark to light theme', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider('dark');

      const button = screen.getByRole('button', { name: /switch to light mode/i });
      await user.click(button);

      // After toggle, should show "switch to dark mode"
      expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
    });

    it('persists theme change to localStorage', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');
      await user.click(button);

      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });

    it('cycles through themes: light -> dark -> light', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');

      // First click: light -> dark
      await user.click(button);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');

      // Second click: dark -> light
      await user.click(button);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
    });

    it('updates document class when toggling theme', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider('light');

      expect(document.documentElement.classList.contains('dark')).toBe(false);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('System theme preference', () => {
    it('uses system preference when no stored preference exists (light)', () => {
      mockMatchMedia(false); // System prefers light
      localStorage.removeItem(STORAGE_KEY);

      renderWithThemeProvider();

      expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
    });

    it('uses system preference when no stored preference exists (dark)', () => {
      mockMatchMedia(true); // System prefers dark
      localStorage.removeItem(STORAGE_KEY);

      renderWithThemeProvider();

      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    });

    it('toggles from system theme to explicit preference', async () => {
      const user = userEvent.setup();
      mockMatchMedia(false); // System prefers light
      localStorage.removeItem(STORAGE_KEY);

      renderWithThemeProvider();

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

      const button = screen.getByRole('button');
      await user.click(button);

      // Should now have an explicit preference stored
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });

    it('stored preference overrides system preference', () => {
      mockMatchMedia(true); // System prefers dark
      localStorage.setItem(STORAGE_KEY, 'light'); // But user prefers light

      renderWithThemeProvider('light');

      expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Cycling between all theme states', () => {
    it('handles cycling when starting from system preference', async () => {
      const user = userEvent.setup();
      mockMatchMedia(false); // System prefers light
      localStorage.removeItem(STORAGE_KEY);

      renderWithThemeProvider();

      const button = screen.getByRole('button');

      // Initial: system light (no stored preference)
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();

      // Click 1: system light -> explicit dark
      await user.click(button);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();

      // Click 2: explicit dark -> explicit light
      await user.click(button);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
      expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();

      // Click 3: explicit light -> explicit dark
      await user.click(button);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    });

    it('handles cycling when system preference is dark', async () => {
      const user = userEvent.setup();
      mockMatchMedia(true); // System prefers dark
      localStorage.removeItem(STORAGE_KEY);

      renderWithThemeProvider();

      const button = screen.getByRole('button');

      // Initial: system dark
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();

      // Click 1: system dark -> explicit light
      await user.click(button);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('light');

      // Click 2: explicit light -> explicit dark
      await user.click(button);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });
  });

  describe('Styling', () => {
    it('applies correct CSS classes', () => {
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'w-9',
        'h-9',
        'rounded-full',
        'bg-gray-100',
        'dark:bg-[#1e2433]',
        'border',
        'border-gray-300',
        'dark:border-slate-700'
      );
    });

    it('has hover styles classes', () => {
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');
      expect(button.className).toContain('hover:text-gray-900');
      expect(button.className).toContain('hover:border-teal-500');
    });

    it('has transition classes', () => {
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-colors');
    });

    it('is clickable with cursor pointer', () => {
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');
      expect(button).toHaveClass('cursor-pointer');
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');
      
      // Focus the button
      await user.tab();
      expect(button).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });

    it('can be activated with Space key', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard(' ');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });

    it('has proper button role', () => {
      renderWithThemeProvider('light');

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('provides descriptive aria-label', () => {
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });
  });

  describe('Multiple toggles', () => {
    it('handles rapid toggling', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');

      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });

    it('maintains consistency after multiple toggles', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider('light');

      const button = screen.getByRole('button');

      for (let i = 0; i < 5; i++) {
        await user.click(button);
      }

      // Odd number of clicks: should be dark
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
