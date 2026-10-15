import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageSkeleton } from './PageSkeleton';

describe('PageSkeleton', () => {
  it('renders an accessible loading status', () => {
    render(<PageSkeleton />);

    const status = screen.getByRole('status', { name: 'Loading page…' });
    expect(status).toBeInTheDocument();
  });

  it('renders the expected number of placeholder blocks', () => {
    const { container } = render(<PageSkeleton />);

    const blocks = container.querySelectorAll('[data-testid="skeleton-block"]');
    expect(blocks).toHaveLength(5);
  });

  it('renders one header block and four row blocks', () => {
    const { container } = render(<PageSkeleton />);

    const headerBlocks = container.querySelectorAll(
      '[data-testid="skeleton-block"][data-variant="header"]',
    );
    const rowBlocks = container.querySelectorAll(
      '[data-testid="skeleton-block"][data-variant="row"]',
    );

    expect(headerBlocks).toHaveLength(1);
    expect(rowBlocks).toHaveLength(4);
  });
});