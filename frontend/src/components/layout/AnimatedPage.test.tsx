import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnimatedPage from './AnimatedPage';

describe('AnimatedPage', () => {
  it('renders children', () => {
    render(
      <AnimatedPage>
        <p>page content</p>
      </AnimatedPage>,
    );
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('applies fade-in-up animation class', () => {
    const { container } = render(
      <AnimatedPage>
        <span>content</span>
      </AnimatedPage>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('animate-fade-in-up');
  });

  it('sets will-change style to prevent layout shift', () => {
    const { container } = render(
      <AnimatedPage>
        <span>content</span>
      </AnimatedPage>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.willChange).toBe('opacity, transform');
  });
});
