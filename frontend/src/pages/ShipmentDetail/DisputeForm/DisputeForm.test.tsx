import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DisputeForm from './DisputeForm';

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));
vi.mock('../../../services/api/client', () => ({ apiClient: { post: mockPost } }));

describe('DisputeForm', () => {
  it('shows validation when the description is shorter than 50 characters', async () => {
    render(<DisputeForm shipmentId="SHP-1" onClose={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/Description/), 'Too short');
    fireEvent.submit(screen.getByRole('button', { name: 'Submit Dispute' }).closest('form')!);
    expect(await screen.findByText('Description must be at least 50 characters')).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('submits a valid dispute and calls onSuccess', async () => {
    const result = { referenceNumber: 'DSP-1', status: 'OPEN', createdAt: '2026-01-01', type: 'DAMAGED', description: 'x'.repeat(60) };
    mockPost.mockResolvedValue({ data: { data: result } });
    const onSuccess = vi.fn();
    render(<DisputeForm shipmentId="SHP-1" onClose={vi.fn()} onSuccess={onSuccess} />);
    await userEvent.selectOptions(screen.getByLabelText('Dispute Type'), 'DAMAGED');
    await userEvent.type(screen.getByLabelText(/Description/), result.description);
    await userEvent.click(screen.getByRole('button', { name: 'Submit Dispute' }));
    expect(await screen.findByText('DSP-1')).toBeInTheDocument();
    expect(mockPost).toHaveBeenCalledWith('/shipments/SHP-1/disputes', expect.any(FormData), expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }));
    expect(onSuccess).toHaveBeenCalledWith(result);
  });
});
