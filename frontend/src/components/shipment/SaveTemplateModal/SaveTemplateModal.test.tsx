import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import SaveTemplateModal from './SaveTemplateModal';

const saveTemplateMock = vi.fn();

vi.mock('@services/api/endpoints/shipments', () => ({
  shipmentsApi: {
    saveTemplate: (...args: unknown[]) => saveTemplateMock(...args),
  },
}));

describe('SaveTemplateModal', () => {
  beforeEach(() => {
    saveTemplateMock.mockReset();
  });

  it('renders nothing when closed', () => {
    render(<SaveTemplateModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Save Template')).not.toBeInTheDocument();
  });

  it('shows a validation error when the name is empty', async () => {
    render(<SaveTemplateModal isOpen onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Template name is required')).toBeInTheDocument();
    expect(saveTemplateMock).not.toHaveBeenCalled();
  });

  it('saves the template successfully and closes the modal', async () => {
    saveTemplateMock.mockResolvedValue({ _id: 't1', name: 'My Template' });
    const onClose = vi.fn();
    render(<SaveTemplateModal isOpen onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Template name'), 'My Template');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(saveTemplateMock).toHaveBeenCalledWith({ name: 'My Template' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('shows an error message when saving fails', async () => {
    saveTemplateMock.mockRejectedValue(new Error('network error'));
    const onClose = vi.fn();
    render(<SaveTemplateModal isOpen onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Template name'), 'My Template');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Failed to save template')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
