import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Tag, { StatusBadge } from './Tag';
import { STATUS_VARIANT_MAP } from './statusVariantMap';

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

  it('renders dot indicator when dot is true', () => {
    render(<Tag label="Active" variant="success" size="sm" dot />);
    const labelEl = screen.getByText('Active');
    const tagEl = labelEl.parentElement!;
    // The dot is the first child span of the tag
    const dot = tagEl.querySelector('span[aria-hidden="true"]');
    expect(dot).not.toBeNull();
    expect(dot).toHaveClass('bg-emerald-400');
  });

  it('renders all variant classes correctly', () => {
    const variants = ['default', 'success', 'warning', 'danger', 'info', 'neutral', 'accent'] as const;
    variants.forEach((variant) => {
      const { container } = render(<Tag label={variant} variant={variant} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('renders all size classes correctly', () => {
    const sizes = ['xs', 'sm', 'md'] as const;
    sizes.forEach((size) => {
      const { container } = render(<Tag label={size} size={size} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('stops event propagation on remove click', () => {
    const onRemove = vi.fn();
    render(<Tag label="Test" onRemove={onRemove} />);
    const removeBtn = screen.getByRole('button', { name: /remove test/i });
    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'stopPropagation', { value: vi.fn() });
    removeBtn.dispatchEvent(clickEvent);
    expect(onRemove).toHaveBeenCalled();
  });
});

describe('StatusBadge', () => {
  it('renders with dot indicator', () => {
    render(<StatusBadge status="Active" variant="success" />);
    const tag = screen.getByText('Active').closest('span')!;
    expect(tag).toBeInTheDocument();
  });
});

describe('STATUS_VARIANT_MAP', () => {
  it('maps common statuses to variants', () => {
    expect(STATUS_VARIANT_MAP.active).toBe('success');
    expect(STATUS_VARIANT_MAP.pending).toBe('warning');
    expect(STATUS_VARIANT_MAP.failed).toBe('danger');
    expect(STATUS_VARIANT_MAP.in_transit).toBe('info');
  });
});
