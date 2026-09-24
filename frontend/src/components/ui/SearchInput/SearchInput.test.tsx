import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
  it('debounces value changes until typing pauses', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = vi.fn();

    render(<SearchInput value="" onChange={onChange} debounceMs={300} />);

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'abc');

    expect(onChange).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(onChange).toHaveBeenCalledWith('abc');
  });

  it('clears the value and refocuses the input when the clear button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = vi.fn();

    render(<SearchInput value="shipment" onChange={onChange} />);

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    await user.click(clearButton);

    const input = screen.getByPlaceholderText('Search...');

    expect(input).toHaveValue('');
    expect(onChange).toHaveBeenCalledWith('');
    expect(input).toHaveFocus();
  });
});
