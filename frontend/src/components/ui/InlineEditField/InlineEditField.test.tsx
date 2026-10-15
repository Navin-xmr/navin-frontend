import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import InlineEditField from './InlineEditField';

interface DefaultProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  [key: string]: unknown;
}

const setup = (overrides: Partial<DefaultProps> = {}) => {
  const props: DefaultProps = {
    value: 'Initial value',
    onSave: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return {
    props,
    ...render(<InlineEditField {...props} />),
  };
};

describe('InlineEditField', () => {
  it('renders the value in display mode', () => {
    setup({ value: 'Hello world' });
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders the placeholder when value is empty', () => {
    setup({ value: '', placeholder: 'Click to edit' });
    expect(screen.getByText('Click to edit')).toBeInTheDocument();
  });

  it('enters edit mode when the edit button is clicked and pre-fills the input', async () => {
    const user = userEvent.setup();
    setup({ value: 'Current value' });

    await user.click(screen.getByRole('button', { name: /edit field/i }));

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Current value');
  });

  it('saves the new value and exits edit mode when Save changes is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    setup({ value: 'Old value', onSave });

    await user.click(screen.getByRole('button', { name: /edit field/i }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'New value');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(onSave).toHaveBeenCalledWith('New value');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('saves when Enter is pressed in single-line mode', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    setup({ value: 'Old value', onSave });

    await user.click(screen.getByRole('button', { name: /edit field/i }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Entered value{Enter}');

    expect(onSave).toHaveBeenCalledWith('Entered value');
  });

  it('cancels editing without saving and restores the original value', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    setup({ value: 'Original', onSave });

    await user.click(screen.getByRole('button', { name: /edit field/i }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Changed');
    await user.click(screen.getByRole('button', { name: /cancel editing/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Original')).toBeInTheDocument();
  });

  it('cancels editing when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    setup({ value: 'Original', onSave });

    await user.click(screen.getByRole('button', { name: /edit field/i }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Changed{Escape}');

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Original')).toBeInTheDocument();
  });

  it('shows a validation error and does not call onSave when validation fails', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const validate = vi.fn((value: string) =>
      value.trim().length === 0 ? 'Value is required' : null,
    );
    setup({ value: 'Original', onSave, validate });

    await user.click(screen.getByRole('button', { name: /edit field/i }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Value is required')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('displays the error message and stays in edit mode when onSave rejects', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));
    setup({ value: 'Original', onSave });

    await user.click(screen.getByRole('button', { name: /edit field/i }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'New value');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Save failed')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('hides the edit button when isEditable is false', () => {
    setup({ value: 'Read only', isEditable: false });
    expect(
      screen.queryByRole('button', { name: /edit field/i }),
    ).not.toBeInTheDocument();
  });

  it('hides the edit button when readOnly is true', () => {
    setup({ value: 'Read only', readOnly: true });
    expect(
      screen.queryByRole('button', { name: /edit field/i }),
    ).not.toBeInTheDocument();
  });

  it('renders a textarea in multiline mode and does not save on Enter', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    setup({ value: 'Line one', onSave, multiline: true });

    await user.click(screen.getByRole('button', { name: /edit field/i }));
    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');

    await user.clear(textarea);
    await user.type(textarea, 'Line one{Enter}Line two');

    expect(onSave).not.toHaveBeenCalled();
  });
});