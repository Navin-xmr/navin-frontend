import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChipGroup } from './ChipGroup';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('ChipGroup', () => {
  it('renders all options as chips', () => {
    render(<ChipGroup options={options} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('renders with group role and aria-label', () => {
    render(<ChipGroup options={options} aria-label="My group" />);
    const group = screen.getByRole('group', { name: 'My group' });
    expect(group).toBeInTheDocument();
  });

  it('toggles selection in multiSelect mode via onChange', () => {
    const onChange = vi.fn();
    render(
      <ChipGroup
        options={options}
        multiSelect
        selected={['a']}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByText('Option B'));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);

    onChange.mockClear();
    fireEvent.click(screen.getByText('Option A'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('replaces selection in single-select mode and clears when clicking selected', () => {
    const onChange = vi.fn();
    render(
      <ChipGroup options={options} selected={['a']} onChange={onChange} />
    );

    fireEvent.click(screen.getByText('Option B'));
    expect(onChange).toHaveBeenCalledWith(['b']);

    onChange.mockClear();
    fireEvent.click(screen.getByText('Option A'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('reflects controlled selected prop via aria-checked', () => {
    render(<ChipGroup options={options} selected={['a', 'c']} />);
    expect(screen.getByText('Option A')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Option B')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('Option C')).toHaveAttribute('aria-checked', 'true');
  });

  it('propagates size and defaultVariant to chips', () => {
    render(
      <ChipGroup options={options} size="lg" defaultVariant="outlined" />
    );
    const chip = screen.getByText('Option A');
    expect(chip).toHaveAttribute('data-size', 'lg');
    expect(chip).toHaveAttribute('data-variant', 'outlined');
  });

  it('allows per-option variant override', () => {
    render(
      <ChipGroup
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B', variant: 'filled' },
        ]}
        defaultVariant="outlined"
      />
    );
    expect(screen.getByText('Option A')).toHaveAttribute('data-variant', 'outlined');
    expect(screen.getByText('Option B')).toHaveAttribute('data-variant', 'filled');
  });

  it('applies className to the group', () => {
    render(<ChipGroup options={options} className="custom-class" />);
    const group = screen.getByRole('group');
    expect(group).toHaveClass('custom-class');
  });
});