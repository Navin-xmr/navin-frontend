import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  const renderTooltip = () =>
    render(
      <Tooltip content="Tooltip content">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

  it('hides the tooltip content initially', () => {
    renderTooltip();

    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip).toHaveAttribute('aria-hidden', 'true');
    expect(tooltip).toHaveClass('opacity-0');
  });

  it('shows the tooltip on hover', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.hover(screen.getByRole('button', { name: 'Trigger' }));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveAttribute('aria-hidden', 'false');
      expect(tooltip).not.toHaveClass('opacity-0');
    });
  });

  it('hides the tooltip when the mouse leaves', async () => {
    const user = userEvent.setup();
    renderTooltip();

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveAttribute('aria-hidden', 'false');
    });

    await user.unhover(trigger);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', { hidden: true });
      expect(tooltip).toHaveAttribute('aria-hidden', 'true');
      expect(tooltip).toHaveClass('opacity-0');
    });
  });

  it('shows the tooltip on focus', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveAttribute('aria-hidden', 'false');
      expect(tooltip).not.toHaveClass('opacity-0');
    });
  });

  it('hides the tooltip on blur', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveAttribute('aria-hidden', 'false');
    });

    await user.tab();

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', { hidden: true });
      expect(tooltip).toHaveAttribute('aria-hidden', 'true');
      expect(tooltip).toHaveClass('opacity-0');
    });
  });

  it('dismisses the tooltip when Escape is pressed while visible', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.hover(screen.getByRole('button', { name: 'Trigger' }));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveAttribute('aria-hidden', 'false');
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', { hidden: true });
      expect(tooltip).toHaveAttribute('aria-hidden', 'true');
      expect(tooltip).toHaveClass('opacity-0');
    });
  });
});