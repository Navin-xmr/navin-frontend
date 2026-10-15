import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders an img with the provided src and alt=name when src is given', () => {
    render(<Avatar name="Jane Doe" src="https://example.com/avatar.png" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
    expect(img).toHaveAttribute('alt', 'Jane Doe');
  });

  it('falls back to initials when src is omitted (single-word name)', () => {
    render(<Avatar name="Jane" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('JA')).toBeInTheDocument();
  });

  it('falls back to initials when src is omitted (multi-word name)', () => {
    render(<Avatar name="Jane Doe" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies the sm size classes', () => {
    render(<Avatar name="Jane Doe" />);

    const container = screen.getByLabelText('Jane Doe');
    expect(container).toHaveClass('w-8', 'h-8', 'text-xs');
  });

  it('applies the md size classes', () => {
    render(<Avatar name="Jane Doe" size="md" />);

    const container = screen.getByLabelText('Jane Doe');
    expect(container).toHaveClass('w-10', 'h-10', 'text-sm');
  });

  it('applies the lg size classes', () => {
    render(<Avatar name="Jane Doe" size="lg" />);

    const container = screen.getByLabelText('Jane Doe');
    expect(container).toHaveClass('w-14', 'h-14', 'text-base');
  });

  it('defaults to the md size classes', () => {
    render(<Avatar name="Jane Doe" />);

    const container = screen.getByLabelText('Jane Doe');
    expect(container).toHaveClass('w-10', 'h-10', 'text-sm');
  });

  it('sets aria-label to the name on the container', () => {
    render(<Avatar name="Jane Doe" />);

    expect(screen.getByLabelText('Jane Doe')).toBeInTheDocument();
  });

  it('falls back to initials when the image fires an error event', () => {
    render(<Avatar name="Jane Doe" src="https://example.com/avatar.png" />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('appends a custom className', () => {
    render(<Avatar name="Jane Doe" className="custom-class" />);

    const container = screen.getByLabelText('Jane Doe');
    expect(container).toHaveClass('custom-class');
  });
});