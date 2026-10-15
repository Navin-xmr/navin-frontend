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