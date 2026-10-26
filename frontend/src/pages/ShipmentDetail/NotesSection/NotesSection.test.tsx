import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotesSection from './NotesSection';

const { mockGetNotes, mockAddNote, mockAddToast } = vi.hoisted(() => ({ mockGetNotes: vi.fn(), mockAddNote: vi.fn(), mockAddToast: vi.fn() }));
vi.mock('../../../services/api/endpoints/shipments', () => ({ shipmentApi: { getNotes: mockGetNotes, addNote: mockAddNote } }));
vi.mock('../../../context/ToastContext', () => ({ useToast: () => ({ addToast: mockAddToast }) }));

describe('NotesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('shows an empty state when the shipment has no notes', async () => {
    mockGetNotes.mockResolvedValue([]);
    render(<NotesSection shipmentId="SHP-1" userRole="company" />);

    expect(await screen.findByText('No notes yet.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error state with a retry, and never invents notes, when loading fails', async () => {
    mockGetNotes.mockRejectedValue(new Error('network down'));
    render(<NotesSection shipmentId="SHP-1" userRole="customer" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("Couldn't load notes for this shipment.");
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByText('No notes yet.')).not.toBeInTheDocument();
    expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
    expect(screen.queryByText('Mike Torres')).not.toBeInTheDocument();
  });

  it('loads the notes when Retry is clicked after a failure', async () => {
    mockGetNotes.mockRejectedValueOnce(new Error('network down'));
    mockGetNotes.mockResolvedValueOnce([{ id: 'n3', author: { name: 'Alex', initials: 'A' }, timestamp: 'Today', text: 'Back online', visibility: 'customer' }]);
    render(<NotesSection shipmentId="SHP-1" userRole="customer" />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Back online')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(mockGetNotes).toHaveBeenCalledTimes(2);
  });

  it('shows the empty state to a customer when every note is internal', async () => {
    mockGetNotes.mockResolvedValue([{ id: 'n4', author: { name: 'Alex', initials: 'A' }, timestamp: 'Today', text: 'Internal only', visibility: 'internal' }]);
    render(<NotesSection shipmentId="SHP-1" userRole="customer" />);

    expect(await screen.findByText('No notes yet.')).toBeInTheDocument();
    expect(screen.queryByText('Internal only')).not.toBeInTheDocument();
  });
});
