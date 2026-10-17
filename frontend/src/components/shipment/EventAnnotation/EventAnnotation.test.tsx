import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EventAnnotation from './EventAnnotation';
import type { Annotation } from './EventAnnotation';

const existing: Annotation[] = [
  { id: 'ann-1', author: 'You', text: 'Arrived at hub', timestamp: 'Jan 1, 2026, 10:00 AM' },
  { id: 'ann-2', author: 'Alex', text: 'Customs cleared', timestamp: 'Jan 2, 2026, 11:00 AM' },
];

describe('EventAnnotation', () => {
  it('starts collapsed and shows the empty-state toggle label', () => {
    render(<EventAnnotation eventId="evt-1" />);

    const toggle = screen.getByRole('button', { name: /add annotation/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: 'Annotations' })).not.toBeInTheDocument();
  });

  it('opens the panel with an empty-state message when there are no annotations', async () => {
    render(<EventAnnotation eventId="evt-1" />);

    await userEvent.click(screen.getByRole('button', { name: /add annotation/i }));

    expect(screen.getByRole('region', { name: 'Annotations' })).toBeInTheDocument();
    expect(screen.getByText('No annotations yet. Be the first to add one.')).toBeInTheDocument();
  });

  it('renders existing annotations and the count in the toggle', async () => {
    render(<EventAnnotation eventId="evt-1" annotations={existing} />);

    const toggle = screen.getByRole('button', { name: /2 annotations/i });
    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Arrived at hub')).toBeInTheDocument();
    expect(screen.getByText('Customs cleared')).toBeInTheDocument();
  });

  it('adds a trimmed annotation and calls onAdd', async () => {
    const onAdd = vi.fn();
    render(<EventAnnotation eventId="evt-1" currentUser="Jane" onAdd={onAdd} />);

    await userEvent.click(screen.getByRole('button', { name: /add annotation/i }));
    const input = screen.getByLabelText('Write an annotation');
    await userEvent.type(input, '  Package delayed  ');
    await userEvent.click(screen.getByRole('button', { name: 'Submit annotation' }));

    expect(onAdd).toHaveBeenCalledWith('evt-1', 'Package delayed');
    expect(screen.getByText('Package delayed')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(screen.getByRole('button', { name: /1 annotation/i })).toBeInTheDocument();
  });

  it('submits on Enter but not on Shift+Enter', async () => {
    const onAdd = vi.fn();
    render(<EventAnnotation eventId="evt-1" onAdd={onAdd} />);

    await userEvent.click(screen.getByRole('button', { name: /add annotation/i }));
    const input = screen.getByLabelText('Write an annotation');
    await userEvent.type(input, 'First line{Shift>}{Enter}{/Shift}');
    expect(onAdd).not.toHaveBeenCalled();

    await userEvent.type(input, 'second line{Enter}');
    expect(onAdd).toHaveBeenCalledWith('evt-1', 'First line\nsecond line');
  });

  it('does not submit an empty or whitespace-only note', async () => {
    const onAdd = vi.fn();
    render(<EventAnnotation eventId="evt-1" onAdd={onAdd} />);

    await userEvent.click(screen.getByRole('button', { name: /add annotation/i }));
    const submit = screen.getByRole('button', { name: 'Submit annotation' });
    expect(submit).toBeDisabled();

    const input = screen.getByLabelText('Write an annotation');
    await userEvent.type(input, '   ');
    expect(submit).toBeDisabled();

    await userEvent.type(input, '{Enter}');
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByText('No annotations yet. Be the first to add one.')).toBeInTheDocument();
  });

  it('only shows delete for the current user and removes the annotation on delete', async () => {
    const onDelete = vi.fn();
    render(<EventAnnotation eventId="evt-1" annotations={existing} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole('button', { name: /2 annotations/i }));

    expect(
      screen.queryByRole('button', { name: 'Delete annotation: "Customs cleared"' }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete annotation: "Arrived at hub"' }));

    expect(onDelete).toHaveBeenCalledWith('evt-1', 'ann-1');
    expect(screen.queryByText('Arrived at hub')).not.toBeInTheDocument();
    expect(screen.getByText('Customs cleared')).toBeInTheDocument();
  });
});
