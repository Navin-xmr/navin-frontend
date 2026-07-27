import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card, { CardHeader, CardBody, CardFooter } from './Card';

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

  it('applies padding', () => {
    render(<CardBody>Body</CardBody>);
    const body = screen.getByText('Body').closest('div')!;
    expect(body.className).toContain('p-6');
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
