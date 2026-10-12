import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Combobox, { type ComboboxOption } from './Combobox';

// jsdom does not implement scrollIntoView — Combobox calls it when navigating options.
beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const OPTIONS: ComboboxOption[] = [
  { value: 'apple', label: 'Apple', sublabel: 'Fruit' },
  { value: 'banana', label: 'Banana', sublabel: 'Fruit' },
  { value: 'carrot', label: 'Carrot', sublabel: 'Vegetable' },
];

function renderCombobox(props: Partial<Parameters<typeof Combobox>[0]> = {}) {
  const defaultOnChange = vi.fn();
  const mergedProps = { onChange: defaultOnChange, ...props };
  const result = render(
    <Combobox
      value=""
      options={OPTIONS}
      ariaLabel="Test combobox"
      id="test-cb"
      {...mergedProps}
    />,
  );
  return { ...result, onChange: mergedProps.onChange };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Combobox', () => {
  // ── Initial render ─────────────────────────────────────────────────────────

  describe('initial render', () => {
    it('renders the combobox input', () => {
      renderCombobox();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders with the provided placeholder', () => {
      renderCombobox({ placeholder: 'Pick a fruit…' });
      expect(screen.getByPlaceholderText('Pick a fruit…')).toBeInTheDocument();
    });

    it('renders with the controlled value', () => {
      renderCombobox({ value: 'Apple' });
      expect(screen.getByRole('combobox')).toHaveValue('Apple');
    });

    it('dropdown is closed on initial render', () => {
      renderCombobox();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('clear button is not visible when value is empty', () => {
      renderCombobox({ value: '' });
      expect(screen.queryByRole('button', { name: /clear input/i })).not.toBeInTheDocument();
    });
  });

  // ── Opening the dropdown ───────────────────────────────────────────────────

  describe('opening the dropdown', () => {
    it('opens the dropdown when the chevron toggle button is clicked', async () => {
      const user = userEvent.setup();
      renderCombobox({ value: '' });

      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens the dropdown when the user types in the input', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Combobox
          value=""
          onChange={onChange}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
        />,
      );

      await user.type(screen.getByRole('combobox'), 'a');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('shows all options when the input is empty and dropdown opens', async () => {
      const user = userEvent.setup();
      renderCombobox({ value: '' });

      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      expect(screen.getAllByRole('option').length).toBe(OPTIONS.length);
    });

    it('shows option labels in the dropdown', async () => {
      const user = userEvent.setup();
      renderCombobox({ value: '' });

      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Carrot')).toBeInTheDocument();
    });

    it('shows sublabels in the dropdown', async () => {
      const user = userEvent.setup();
      renderCombobox({ value: '' });

      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      expect(screen.getAllByText('Fruit').length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Filtering ─────────────────────────────────────────────────────────────

  describe('filtering', () => {
    it('filters options based on typed text', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      // Use a controlled wrapper to feed changing value back in
      const { rerender } = render(
        <Combobox
          value=""
          onChange={onChange}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
        />,
      );

      // Simulate typing 'ban' by re-rendering with updated value
      await user.type(screen.getByRole('combobox'), 'ban');
      rerender(
        <Combobox
          value="ban"
          onChange={onChange}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
        />,
      );

      const options = screen.getAllByRole('option');
      // Only 'Banana' should match
      expect(options.length).toBe(1);
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });

    it('shows the no-results message when nothing matches', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Combobox
          value="zzz"
          onChange={onChange}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
          noResultsMessage="Nothing found"
        />,
      );

      // Open dropdown — the message appears in both the live region (sr-only)
      // and the visible listbox option, so use getAllByText
      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      expect(screen.getAllByText('Nothing found').length).toBeGreaterThanOrEqual(1);
    });

    it('is case-insensitive when filtering', async () => {
      const onChange = vi.fn();

      render(
        <Combobox
          value="APPLE"
          onChange={onChange}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /open suggestions/i }));
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(1);
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });
  });

  // ── Selecting an option ───────────────────────────────────────────────────

  describe('selecting an option', () => {
    it('calls onChange with the option label when an option is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Combobox
          value=""
          onChange={onChange}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
        />,
      );

      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      await user.click(screen.getByText('Banana'));
      expect(onChange).toHaveBeenCalledWith('Banana');
    });

    it('calls onSelectOption with the full option object when provided', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      const onChange = vi.fn();

      render(
        <Combobox
          value=""
          onChange={onChange}
          onSelectOption={onSelectOption}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
        />,
      );

      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      await user.click(screen.getByText('Carrot'));
      expect(onSelectOption).toHaveBeenCalledWith(OPTIONS[2]);
    });

    it('closes the dropdown after selecting an option', async () => {
      const user = userEvent.setup();

      // Use a controlled wrapper so the value prop updates when onChange fires,
      // preventing the focus handler from reopening the dropdown with stale value.
      function Wrapper() {
        const [val, setVal] = React.useState('');
        return (
          <Combobox
            value={val}
            onChange={setVal}
            options={OPTIONS}
            ariaLabel="Test combobox"
            id="cb"
          />
        );
      }

      render(<Wrapper />);
      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      await user.click(screen.getByText('Apple'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  // ── Keyboard navigation ───────────────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('opens the dropdown with ArrowDown when closed', async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          value=""
          onChange={vi.fn()}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
        />,
      );

      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('navigates options with ArrowDown / ArrowUp', async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          value=""
          onChange={vi.fn()}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
        />,
      );

      const input = screen.getByRole('combobox');
      await user.click(screen.getByRole('button', { name: /open suggestions/i }));

      await user.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', 'cb-listbox-option-0');

      await user.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', 'cb-listbox-option-1');

      await user.keyboard('{ArrowUp}');
      expect(input).toHaveAttribute('aria-activedescendant', 'cb-listbox-option-0');
    });

    it('selects the active option with Enter', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Combobox
          value=""
          onChange={onChange}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
        />,
      );

      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      await user.keyboard('{ArrowDown}{Enter}');
      expect(onChange).toHaveBeenCalledWith('Apple');
    });

    it('closes the dropdown with Escape', async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          value=""
          onChange={vi.fn()}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
        />,
      );

      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  // ── Clear button ──────────────────────────────────────────────────────────

  describe('clear button', () => {
    it('shows the clear button when there is a value and clearable=true', () => {
      renderCombobox({ value: 'Apple', clearable: true });
      expect(screen.getByRole('button', { name: /clear input/i })).toBeInTheDocument();
    });

    it('calls onChange with empty string when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Combobox
          value="Apple"
          onChange={onChange}
          options={OPTIONS}
          ariaLabel="Test combobox"
          id="cb"
          clearable
        />,
      );

      await user.click(screen.getByRole('button', { name: /clear input/i }));
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('does not show the clear button when clearable=false', () => {
      renderCombobox({ value: 'Apple', clearable: false });
      expect(screen.queryByRole('button', { name: /clear input/i })).not.toBeInTheDocument();
    });
  });

  // ── Loading state ─────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows the loading message when isLoading=true', async () => {
      const user = userEvent.setup();
      renderCombobox({ isLoading: true, loadingMessage: 'Fetching…' });

      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      expect(screen.getByText('Fetching…')).toBeInTheDocument();
    });
  });

  // ── Disabled state ────────────────────────────────────────────────────────

  describe('disabled state', () => {
    it('disables the input when disabled=true', () => {
      renderCombobox({ disabled: true });
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  // ── Closing on outside click ──────────────────────────────────────────────

  describe('outside click', () => {
    it('closes the dropdown when clicking outside the component', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Combobox
            value=""
            onChange={vi.fn()}
            options={OPTIONS}
            ariaLabel="Test combobox"
            id="cb"
          />
          <button>Outside</button>
        </div>,
      );

      await user.click(screen.getByRole('button', { name: /open suggestions/i }));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Outside' }));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
