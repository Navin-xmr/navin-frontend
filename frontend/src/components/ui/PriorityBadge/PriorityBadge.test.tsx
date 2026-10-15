import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PriorityBadge } from './PriorityBadge';

describe('PriorityBadge', () => {
  it('renders null when no priority is provided', () => {
    const { container } = render(<PriorityBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the correct label for each priority level', () => {
    const { rerender } = render(<PriorityBadge priority="URGENT" />);
    expect(screen.getByText('Urgent')).toBeInTheDocument();

    rerender(<PriorityBadge priority="STANDARD" />);
    expect(screen.getByText('Standard')).toBeInTheDocument();

    rerender(<PriorityBadge priority="ECONOMY" />);
    expect(screen.getByText('Economy')).toBeInTheDocument();
  });

  it('applies the correct Tag variant per priority', () => {
    const { rerender } = render(<PriorityBadge priority="URGENT" />);
    expect(screen.getByText('Urgent')).toHaveClass('tag--danger');

    rerender(<PriorityBadge priority="STANDARD" />);
    expect(screen.getByText('Standard')).toHaveClass('tag--info');

    rerender(<PriorityBadge priority="ECONOMY" />);
    expect(screen.getByText('Economy')).toHaveClass('tag--neutral');
  });

  it('forwards the className prop to the Tag', () => {
    render(<PriorityBadge priority="URGENT" className="custom-class" />);
    expect(screen.getByText('Urgent')).toHaveClass('custom-class');
  });

  it('renders as a button and invokes onClick on click and keydown when onClick is provided', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<PriorityBadge priority="URGENT" onClick={handleClick} />);

    const badge = screen.getByRole('button');
    expect(badge).toHaveAttribute('tabindex', '0');
    expect(badge).toHaveClass('cursor-pointer');

    await user.click(badge);
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(2);

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it('does not set role or tabIndex when onClick is not provided', () => {
    render(<PriorityBadge priority="URGENT" />);
    const badge = screen.getByText('Urgent');
    expect(badge).not.toHaveAttribute('role');
    expect(badge).not.toHaveAttribute('tabindex');
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PriorityBadge from './PriorityBadge';

describe('PriorityBadge', () => {
  it('renders the label for URGENT priority', () => {
    render(<PriorityBadge priority="URGENT" />);
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('renders the label for STANDARD priority', () => {
    render(<PriorityBadge priority="STANDARD" />);
    expect(screen.getByText('Standard')).toBeInTheDocument();
  });

  it('renders the label for ECONOMY priority', () => {
    render(<PriorityBadge priority="ECONOMY" />);
    expect(screen.getByText('Economy')).toBeInTheDocument();
  });

  it('applies the danger variant for URGENT priority', () => {
    render(<PriorityBadge priority="URGENT" />);
    expect(screen.getByText('Urgent').className).toMatch(/danger/);
  });

  it('applies the info variant for STANDARD priority', () => {
    render(<PriorityBadge priority="STANDARD" />);
    expect(screen.getByText('Standard').className).toMatch(/info/);
  });

  it('applies the neutral variant for ECONOMY priority', () => {
    render(<PriorityBadge priority="ECONOMY" />);
    expect(screen.getByText('Economy').className).toMatch(/neutral/);
  });

  it('returns null when priority is undefined', () => {
    const { container } = render(<PriorityBadge priority={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('has role button and tabIndex 0 when onClick is provided', () => {
    render(<PriorityBadge priority="URGENT" onClick={() => {}} />);
    const wrapper = screen.getByRole('button');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('tabindex', '0');
  });

  it('invokes onClick when clicked', () => {
    const onClick = vi.fn();
    render(<PriorityBadge priority="URGENT" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('invokes onClick when Enter is pressed', () => {
    const onClick = vi.fn();
    render(<PriorityBadge priority="URGENT" onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('invokes onClick when Space is pressed', () => {
    const onClick = vi.fn();
    render(<PriorityBadge priority="URGENT" onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards className', () => {
    render(<PriorityBadge priority="URGENT" className="custom-class" />);
    expect(screen.getByText('Urgent').className).toMatch(/custom-class/);
  });
});