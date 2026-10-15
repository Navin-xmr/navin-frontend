import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ExportDropdown from './ExportDropdown';

describe('ExportDropdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders a trigger button with aria-haspopup="listbox" and toggles aria-expanded on click', () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(<ExportDropdown onExport={onExport} />);

    const trigger = screen.getByRole('button', { name: /export/i });
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens a listbox with the three default options (CSV, JSON, Print / PDF)', () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(<ExportDropdown onExport={onExport} />);

    const trigger = screen.getByRole('button', { name: /export/i });
    fireEvent.click(trigger);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(screen.getByRole('option', { name: /csv/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /json/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /print\s*\/\s*pdf/i })).toBeInTheDocument();
  });

  it('calls onExport with the correct format and closes the menu when an option is clicked', async () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(<ExportDropdown onExport={onExport} />);

    const trigger = screen.getByRole('button', { name: /export/i });
    fireEvent.click(trigger);

    const csvOption = screen.getByRole('option', { name: /csv/i });
    fireEvent.click(csvOption);

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledWith('csv');

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the menu when Escape is pressed while open', () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(<ExportDropdown onExport={onExport} />);

    const trigger = screen.getByRole('button', { name: /export/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the menu on mousedown outside the dropdown', () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(
      <div>
        <ExportDropdown onExport={onExport} />
        <div data-testid="outside">outside</div>
      </div>
    );

    const trigger = screen.getByRole('button', { name: /export/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it("shows 'Failed' on the button when onExport returns a rejected promise", async () => {
    const onExport = vi.fn().mockRejectedValue(new Error('boom'));
    render(<ExportDropdown onExport={onExport} />);

    const trigger = screen.getByRole('button', { name: /export/i });
    fireEvent.click(trigger);

    const csvOption = screen.getByRole('option', { name: /csv/i });
    fireEvent.click(csvOption);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: /failed/i })).toBeInTheDocument();
  });

  it("shows 'Exported!' when onExport resolves, then resets after 2500ms", async () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(<ExportDropdown onExport={onExport} />);

    const trigger = screen.getByRole('button', { name: /export/i });
    fireEvent.click(trigger);

    const jsonOption = screen.getByRole('option', { name: /json/i });
    fireEvent.click(jsonOption);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: /exported!/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /exported!/i })).not.toBeInTheDocument();
  });

  it('disables the trigger when disabled or isLoading is set', () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(<ExportDropdown onExport={onExport} disabled />);

    let trigger = screen.getByRole('button', { name: /export/i });
    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    rerender(<ExportDropdown onExport={onExport} isLoading />);
    trigger = screen.getByRole('button', { name: /export/i });
    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('limits which options render based on the formats prop', () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(<ExportDropdown onExport={onExport} formats={['csv', 'json']} />);

    const trigger = screen.getByRole('button', { name: /export/i });
    fireEvent.click(trigger);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(screen.getByRole('option', { name: /csv/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /json/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /print\s*\/\s*pdf/i })).not.toBeInTheDocument();
  });

  it('triggers export via keyboard Enter/Space on an option', async () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(<ExportDropdown onExport={onExport} />);

    const trigger = screen.getByRole('button', { name: /export/i });
    fireEvent.click(trigger);

    const csvOption = screen.getByRole('option', { name: /csv/i });
    fireEvent.keyDown(csvOption, { key: 'Enter' });

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledWith('csv');

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(trigger);
    const jsonOption = screen.getByRole('option', { name: /json/i });
    fireEvent.keyDown(jsonOption, { key: ' ' });

    expect(onExport).toHaveBeenCalledTimes(2);
    expect(onExport).toHaveBeenLastCalledWith('json');
  });
});