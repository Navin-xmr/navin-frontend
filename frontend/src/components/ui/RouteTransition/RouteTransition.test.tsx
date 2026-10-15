import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RouteTransition from './RouteTransition';

const mockUseRouteTransition = vi.fn();

vi.mock('@context/RouteTransitionContext', () => ({
  useRouteTransition: () => mockUseRouteTransition(),
}));

describe('RouteTransition', () => {
  beforeEach(() => {
    mockUseRouteTransition.mockReset();
  });

  it('renders overlay and progress bar elements', () => {
    mockUseRouteTransition.mockReturnValue({ isLoading: false });

    const { container } = render(<RouteTransition />);

    const overlay = container.querySelector('[data-testid="route-transition-overlay"]');
    const progressBar = container.querySelector('[data-testid="route-transition-progress-bar"]');

    expect(overlay).toBeInTheDocument();
    expect(progressBar).toBeInTheDocument();
  });

  it('shows the overlay and animates the progress bar when isLoading is true', () => {
    mockUseRouteTransition.mockReturnValue({ isLoading: true });

    const { container } = render(<RouteTransition />);

    const overlay = container.querySelector('[data-testid="route-transition-overlay"]');
    const progressBar = container.querySelector('[data-testid="route-transition-progress-bar"]');

    expect(overlay).toHaveClass('opacity-100');
    expect(overlay).toHaveAttribute('aria-hidden', 'false');
    expect(progressBar).toHaveClass('w-3/4');
    expect(progressBar).toHaveStyle({ animation: 'progress-bar 1.5s ease-in-out infinite' });
  });

  it('hides the overlay and resets the progress bar when isLoading is false', () => {
    mockUseRouteTransition.mockReturnValue({ isLoading: false });

    const { container } = render(<RouteTransition />);

    const overlay = container.querySelector('[data-testid="route-transition-overlay"]');
    const progressBar = container.querySelector('[data-testid="route-transition-progress-bar"]');

    expect(overlay).toHaveClass('opacity-0');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(progressBar).toHaveClass('w-0');
    expect(progressBar).toHaveStyle({ animation: 'none' });
  });

  it('injects keyframes style tag containing progress-bar', () => {
    mockUseRouteTransition.mockReturnValue({ isLoading: false });

    const { container } = render(<RouteTransition />);

    const styleTags = container.querySelectorAll('style');
    const hasProgressBarKeyframes = Array.from(styleTags).some((styleTag) =>
      styleTag.textContent?.includes('progress-bar')
    );

    expect(hasProgressBarKeyframes).toBe(true);
  });
});