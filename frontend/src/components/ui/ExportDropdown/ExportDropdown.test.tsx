import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExportDropdown, { type ExportFormat } from './ExportDropdown';

describe('ExportDropdown', () => {
  let onExport: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onExport = vi.fn();
  });

  const renderDropdown = (props: Partial<React.ComponentProps<typeof ExportDropdown>> = {}) =>
    render(<ExportDropdown onExport={onExport} {...props} />);

  describe('rendering', () => {
    it('renders with the default label', () => {
      renderDropdown();
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('renders a custom label when provided', () => {
      renderDropdown({ label: 'Download' });
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });

    it('sets aria-haspopup and aria-expanded on the trigger', () => {
      renderDropdown();
      const trigger = screen.getByRole('button', { name: /export/i });
      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('does not render the menu initially', () => {
      renderDropdown();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('opening the menu', () => {
    it('opens the menu on trigger click and updates aria-expanded', async () => {
      const user = userEvent.setup();
      renderDropdown();
      const trigger = screen.getByRole('button', { name: /export/i });

      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes the menu when the trigger is clicked again', async () => {
      const user = userEvent.setup();
      renderDropdown();
      const trigger = screen.getByRole('button', { name: /export/i });

      await user.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(trigger);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('export callbacks', () => {
    it('invokes onExport with "csv" when the CSV option is clicked', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByRole('button', { name: /export/i }));
      await user.click(screen.getByRole('option', { name: /csv/i }));

      expect(onExport).toHaveBeenCalledTimes(1);
      expect(onExport).toHaveBeenCalledWith('csv');
    });

    it('invokes onExport with "json" when the JSON option is clicked', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByRole('button', { name: /export/i }));
      await user.click(screen.getByRole('option', { name: /json/i }));

      expect(onExport).toHaveBeenCalledTimes(1);
      expect(onExport).toHaveBeenCalledWith('json');
    });

    it('invokes onExport with "print" when the Print option is clicked', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByRole('button', { name: /export/i }));
      await user.click(screen.getByRole('option', { name: /print/i }));

      expect(onExport).toHaveBeenCalledTimes(1);
      expect(onExport).toHaveBeenCalledWith('print');
    });

    it('closes the menu after an option is selected', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByRole('button', { name: /export/i }));
      await user.click(screen.getByRole('option', { name: /csv/i }));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('only renders the provided subset of formats', async () => {
      const user = userEvent.setup();
      const formats: ExportFormat[] = ['csv', 'json'];
      renderDropdown({ formats });
      await user.click(screen.getByRole('button', { name: /export/i }));

      expect(screen.getByRole('option', { name: /csv/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /json/i })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /print/i })).not.toBeInTheDocument();
    });
  });

  describe('keyboard interactions', () => {
    it('closes the menu on Escape from the trigger', async () => {
      const user = userEvent.setup();
      renderDropdown();
      const trigger = screen.getByRole('button', { name: /export/i });

      await user.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes the menu on Escape from the document', async () => {
      const user = userEvent.setup();
      renderDropdown();
      const trigger = screen.getByRole('button', { name: /export/i });

      await user.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('activates an option with Enter', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByRole('button', { name: /export/i }));

      const option = screen.getByRole('option', { name: /csv/i });
      option.focus();
      await user.keyboard('{Enter}');

      expect(onExport).toHaveBeenCalledWith('csv');
    });

    it('activates an option with Space', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByRole('button', { name: /export/i }));

      const option = screen.getByRole('option', { name: /json/i });
      option.focus();
      await user.keyboard(' ');

      expect(onExport).toHaveBeenCalledWith('json');
    });
  });

  describe('disabled and loading states', () => {
    it('does not open the menu when disabled', async () => {
      const user = userEvent.setup();
      renderDropdown({ disabled: true });
      const trigger = screen.getByRole('button', { name: /export/i });

      expect(trigger).toBeDisabled();

      await user.click(trigger);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('does not open the menu when loading', async () => {
      const user = userEvent.setup();
      renderDropdown({ isLoading: true });
      const trigger = screen.getByRole('button', { name: /export/i });

      await user.click(trigger);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('positioning', () => {
    it('applies the dropUp class when dropUp is true', async () => {
      const user = userEvent.setup();
      renderDropdown({ dropUp: true });
      await user.click(screen.getByRole('button', { name: /export/i }));

      const listbox = screen.getByRole('listbox');
      expect(listbox.className).toMatch(/dropUp|drop-up/i);
    });

    it('does not apply the dropUp class by default', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByRole('button', { name: /export/i }));

      const listbox = screen.getByRole('listbox');
      expect(listbox.className).not.toMatch(/dropUp|drop-up/i);
    });
  });
});