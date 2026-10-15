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
  });
});