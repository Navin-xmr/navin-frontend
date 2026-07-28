import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Card, { CardHeader, CardBody, CardFooter, CardLoading, CardEmpty, CardError } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies base styles', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').closest('div')!;
    expect(card.className).toContain('bg-background-card');
    expect(card.className).toContain('rounded-2xl');
  });

  it('applies custom className', () => {
    render(<Card className="my-class">Content</Card>);
    const card = screen.getByText('Content').closest('div')!;
    expect(card).toHaveClass('my-class');
  });

  it('applies hover styles when hover is true', () => {
    render(<Card hover>Hoverable</Card>);
    const card = screen.getByText('Hoverable').closest('div')!;
    expect(card.className).toContain('hover:border-accent-blue');
  });

  it('does not apply hover styles by default', () => {
    render(<Card>No hover</Card>);
    const card = screen.getByText('No hover').closest('div')!;
    expect(card.className).not.toContain('hover:border-accent-blue');
  });

  it('applies glow styles when glow is true', () => {
    render(<Card glow>Glowing</Card>);
    const card = screen.getByText('Glowing').closest('div')!;
    expect(card.className).toContain('after:absolute');
  });

  it('does not apply glow styles by default', () => {
    render(<Card>No glow</Card>);
    const card = screen.getByText('No glow').closest('div')!;
    expect(card.className).not.toContain('after:absolute');
  });

  it('applies padding when padding is true', () => {
    render(<Card padding>Padded</Card>);
    const card = screen.getByText('Padded').closest('div')!;
    expect(card.className).toContain('p-5');
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('applies border-b style', () => {
    render(<CardHeader>Header</CardHeader>);
    const header = screen.getByText('Header').closest('div')!;
    expect(header.className).toContain('border-b');
  });

  it('applies custom className', () => {
    render(<CardHeader className="custom">Header</CardHeader>);
    const header = screen.getByText('Header').closest('div')!;
    expect(header).toHaveClass('custom');
  });
});

describe('CardBody', () => {
  it('renders children', () => {
    render(<CardBody>Body</CardBody>);
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('applies responsive padding', () => {
    render(<CardBody>Body</CardBody>);
    const body = screen.getByText('Body').closest('div')!;
    expect(body.className).toContain('px-5');
    expect(body.className).toContain('sm:px-6');
  });

  it('applies custom className', () => {
    render(<CardBody className="custom">Body</CardBody>);
    const body = screen.getByText('Body').closest('div')!;
    expect(body).toHaveClass('custom');
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies border-t style', () => {
    render(<CardFooter>Footer</CardFooter>);
    const footer = screen.getByText('Footer').closest('div')!;
    expect(footer.className).toContain('border-t');
  });

  it('applies custom className', () => {
    render(<CardFooter className="custom">Footer</CardFooter>);
    const footer = screen.getByText('Footer').closest('div')!;
    expect(footer).toHaveClass('custom');
  });
});

describe('CardLoading', () => {
  it('renders skeleton with provided lines', () => {
    render(<CardLoading lines={3} />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-label', 'Loading content');
  });

  it('renders default number of skeleton lines', () => {
    render(<CardLoading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('CardEmpty', () => {
  it('renders title and description', () => {
    render(<CardEmpty title="No data" description="Nothing to show" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<CardEmpty title="Empty" action={<button>Add item</button>} />);
    expect(screen.getByText('Add item')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(<CardEmpty title="Empty" icon={<span data-testid="custom-icon">X</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});

describe('CardError', () => {
  it('renders error message', () => {
    render(<CardError message="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', () => {
    const onRetry = vi.fn();
    render(<CardError message="Error" onRetry={onRetry} />);
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<CardError title="Custom error" message="Oops" />);
    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });
});
