import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';

describe('DashboardWidgetSkeleton', () => {
  it('renders a single widget by default', () => {
    const { container } = render(<DashboardWidgetSkeleton />);

    const widgets = container.querySelectorAll('.dashboard-widget-skeleton');
    expect(widgets).toHaveLength(1);
  });

  it('renders multiple widgets when count is provided', () => {
    const { container } = render(<DashboardWidgetSkeleton count={3} />);

    const widgets = container.querySelectorAll('.dashboard-widget-skeleton');
    expect(widgets).toHaveLength(3);
  });

  it('applies the expected wrapper classes', () => {
    const { container } = render(<DashboardWidgetSkeleton />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('dashboard-widget-skeleton');
  });

  it('renders the expected number of widgets for a custom count', () => {
    const { container } = render(<DashboardWidgetSkeleton count={5} />);

    const widgets = container.querySelectorAll('.dashboard-widget-skeleton');
    expect(widgets).toHaveLength(5);
  });
});