import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import NotesSection from './NotesSection';

const { mockGetNotes, mockAddNote, mockAddToast } = vi.hoisted(() => ({ mockGetNotes: vi.fn(), mockAddNote: vi.fn(), mockAddToast: vi.fn() }));
vi.mock('../../../services/api/endpoints/shipments', () => ({ shipmentApi: { getNotes: mockGetNotes, addNote: mockAddNote } }));
vi.mock('../../../context/ToastContext', () => ({ useToast: () => ({ addToast: mockAddToast }) }));

describe('NotesSection', () => {
  it('renders fetched notes and lets a company choose visibility', async () => {
    mockGetNotes.mockResolvedValue([{ id: 'n1', author: { name: 'Alex', initials: 'A' }, timestamp: 'Today', text: 'Loaded note', visibility: 'internal' }]);
    render(<NotesSection shipmentId="SHP-1" userRole="company" />);
    expect(await screen.findByText('Loaded note')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Internal Only' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Customer Visible' })).toBeInTheDocument();
  });

  it('posts a note with the selected visibility', async () => {
    mockGetNotes.mockResolvedValue([]);
    mockAddNote.mockResolvedValue({ id: 'n2', author: { name: 'You', initials: 'YO' }, timestamp: 'Now', text: 'A new note', visibility: 'customer' });
    render(<NotesSection shipmentId="SHP-1" userRole="company" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Customer Visible' }));
    await user.type(screen.getByLabelText('Add a Note'), 'A new note');
    await user.click(screen.getByRole('button', { name: 'Post Note' }));
    await waitFor(() => expect(mockAddNote).toHaveBeenCalledWith('SHP-1', 'A new note', 'customer'));
  });
});
