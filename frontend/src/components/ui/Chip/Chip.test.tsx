import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders the label', () => {
    render(<Chip label="Test Chip" />);
    expect(screen.getByText('Test Chip')).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    render(<Chip label="Test Chip" icon={<span data-testid="chip-icon">★</span>} />);
    expect(screen.getByTestId('chip-icon')).toBeInTheDocument();
  });

  it('renders a check icon when selected', () => {
    render(<Chip label="Test Chip" selected />);
    expect(screen.getByTestId('chip-check-icon')).toBeInTheDocument();
  });

  it('does not render a check icon when not selected', () => {
    render(<Chip label="Test Chip" />);
    expect(screen.queryByTestId('chip-check-icon')).not.toBeInTheDocument();
  });

  it('calls onRemove when the remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<Chip label="Test Chip" onRemove={onRemove} />);
    fireEvent.click(screen.getByTestId('chip-remove-button'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('stops propagation when the remove button is clicked', () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    render(<Chip label="Test Chip" onRemove={onRemove} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('chip-remove-button'));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick when the chip is clicked', () => {
    const onClick = vi.fn();
    render(<Chip label="Test Chip" onClick={onClick} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('toggles selection when clicked', () => {
    const onClick = vi.fn();
    const { rerender } = render(<Chip label="Test Chip" selected={false} onClick={onClick} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<Chip label="Test Chip" selected onClick={onClick} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('does not fire callbacks when disabled', () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(<Chip label="Test Chip" disabled onClick={onClick} onRemove={onRemove} />);
    const chip = screen.getByRole('checkbox');
    expect(chip).toBeDisabled();
    fireEvent.click(chip);
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('chip-remove-button'));
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('has the correct accessibility attributes', () => {
    render(<Chip label="Test Chip" selected />);
    const chip = screen.getByRole('checkbox');
    expect(chip).toHaveAttribute('aria-checked', 'true');
    expect(chip).toHaveAttribute('aria-label', 'Test Chip');
  });

  it('applies the variant class', () => {
    render(<Chip label="Test Chip" variant="outlined" />);
    expect(screen.getByRole('checkbox')).toHaveClass('chip--outlined');
  });

  it('applies the size class', () => {
    render(<Chip label="Test Chip" size="small" />);
    expect(screen.getByRole('checkbox')).toHaveClass('chip--small');
  });
});