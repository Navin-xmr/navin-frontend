import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Tag from './Tag';

describe('Tag', () => {
  it('renders the requested variant, size, icon and remove button', () => {
    const onRemove = vi.fn();

    render(
      <Tag
        label="Urgent"
        variant="warning"
        size="sm"
        icon={<span data-testid="tag-icon">!</span>}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByTestId('tag-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove urgent/i })).toBeInTheDocument();
  });
});
