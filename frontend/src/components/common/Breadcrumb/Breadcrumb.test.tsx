import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import type { BreadcrumbProps } from './types';

const renderBreadcrumb = (props: BreadcrumbProps) =>
  render(
    <MemoryRouter>
      <Breadcrumb {...props} />
    </MemoryRouter>,
  );

// The component renders a desktop list and a mobile list; assert against the desktop one.
const getDesktopList = () => within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getAllByRole('list')[0];

describe('Breadcrumb', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Shipments', href: '/shipments' },
  ];

  it('renders a nav landmark labelled Breadcrumb', () => {
    renderBreadcrumb({ items, current: 'Details' });
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders items with an href as links', () => {
    renderBreadcrumb({ items, current: 'Details' });
    const list = getDesktopList();
    expect(within(list).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(within(list).getByRole('link', { name: 'Shipments' })).toHaveAttribute('href', '/shipments');
  });

  it('renders items without an href as plain text', () => {
    renderBreadcrumb({ items: [{ label: 'Home', href: '/' }, { label: 'Archive' }], current: 'Details' });
    const list = getDesktopList();
    expect(within(list).getByText('Archive')).toBeInTheDocument();
    expect(within(list).queryByRole('link', { name: 'Archive' })).not.toBeInTheDocument();
  });

  it('appends the current page and marks it with aria-current', () => {
    renderBreadcrumb({ items, current: 'Details' });
    const current = within(getDesktopList()).getByText('Details');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(within(getDesktopList()).queryByRole('link', { name: 'Details' })).not.toBeInTheDocument();
  });

  it('does not duplicate the current page when it is already in items', () => {
    renderBreadcrumb({ items, current: 'Shipments' });
    const list = getDesktopList();
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText('Shipments')).toHaveAttribute('aria-current', 'page');
  });

  it('uses the provided separator', () => {
    renderBreadcrumb({ items, current: 'Details', separator: '>' });
    expect(within(getDesktopList()).getAllByText('>')).toHaveLength(2);
  });
});
