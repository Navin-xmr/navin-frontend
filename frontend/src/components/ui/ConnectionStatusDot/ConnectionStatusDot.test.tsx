import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConnectionStatusDot } from './ConnectionStatusDot';
import type { ConnectionStatus } from './ConnectionStatusDot';

describe('ConnectionStatusDot', () => {
  const baseClasses = ['inline-block', 'w-2', 'h-2', 'rounded-full'];

  const cases: Array<{
    status: ConnectionStatus;
    title: string;
    colorClass: string;
  }> = [
    {
      status: 'connected',
      title: 'Connected',
      colorClass: 'bg-green-400',
    },
    {
      status: 'reconnecting',
      title: 'Reconnecting',
      colorClass: 'bg-yellow-400',
    },
    {
      status: 'disconnected',
      title: 'Disconnected',
      colorClass: 'bg-red-500',
    },
    {
      status: 'offline',
      title: 'Offline',
      colorClass: 'bg-gray-500',
    },
  ];

  it.each(cases)(
    'renders the $status status with the correct title, aria-label, and color',
    ({ status, title, colorClass }) => {
      render(<ConnectionStatusDot status={status} />);

      const dot = screen.getByTitle(title);
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveAttribute('aria-label', title);
      expect(dot).toHaveClass(colorClass);

      baseClasses.forEach((className) => {
        expect(dot).toHaveClass(className);
      });
    },
  );

  it('renders a span element', () => {
    render(<ConnectionStatusDot status="connected" />);

    const dot = screen.getByTitle('Connected');
    expect(dot.tagName).toBe('SPAN');
  });
});