import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MultiSelect from './MultiSelect';

describe('MultiSelect', () => {
  const options = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Transit', value: 'in-transit' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Customs', value: 'customs' },
    { label: 'Shipped', value: 'shipped' },
  ];

  it('supports selecting, clearing, and searching options', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<MultiSelect options={options} value={[]} onChange={handleChange} placeholder="Select statuses" />);

    await user.click(screen.getByRole('button', { name: /select statuses/i }));
    expect(screen.getByText('Pending')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Pending'));
    expect(handleChange).toHaveBeenCalledWith(['pending']);

    await user.type(screen.getByPlaceholderText('Search options'), 'transit');
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
  });

  it('supports selecting all and showing overflow badges', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const { rerender } = render(
      <MultiSelect
        options={options}
        value={['pending', 'in-transit', 'delivered', 'customs', 'shipped']}
        onChange={handleChange}
        placeholder="Select statuses"
      />,
    );

    expect(screen.getByText('+3 more')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /select statuses/i }));
    await user.click(screen.getByLabelText('Select all'));
    expect(handleChange).toHaveBeenCalledWith([]);

    rerender(<MultiSelect options={options} value={[]} onChange={handleChange} placeholder="Select statuses" />);
    expect(screen.getByText('Select statuses')).toBeInTheDocument();
  });
});
