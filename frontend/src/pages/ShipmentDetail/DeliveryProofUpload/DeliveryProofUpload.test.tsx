import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import DeliveryProofUpload from './DeliveryProofUpload';

const uploadProofMock = vi.fn();

vi.mock('../../../services/api/endpoints/shipments', async () => {
  const actual = await vi.importActual<typeof import('../../../services/api/endpoints/shipments')>(
    '../../../services/api/endpoints/shipments'
  );
  return {
    ...actual,
    shipmentApi: {
      ...actual.shipmentApi,
      uploadProof: (...args: Parameters<typeof actual.shipmentApi.uploadProof>) =>
        uploadProofMock(...args),
    },
  };
});

function makeImageFile(name = 'proof.png') {
  return new File(['x'], name, { type: 'image/png' });
}

describe('DeliveryProofUpload', () => {
  beforeEach(() => {
    uploadProofMock.mockReset();
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();
  });

  it('renders the upload form', () => {
    render(<DeliveryProofUpload shipmentId="ship-1" />);
    expect(screen.getByText(/DELIVERY/)).toBeInTheDocument();
    expect(screen.getByLabelText('Recipient Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit proof/i })).toBeDisabled();
  });

  it('requires a recipient name before submitting', async () => {
    render(<DeliveryProofUpload shipmentId="ship-1" />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, makeImageFile());
    await screen.findByText('proof.png');

    const submitButton = screen.getByRole('button', { name: /submit proof/i });
    expect(submitButton).toBeDisabled();

    fireEvent.submit(submitButton.closest('form') as HTMLFormElement);

    expect(await screen.findByText('Recipient name is required')).toBeInTheDocument();
    expect(uploadProofMock).not.toHaveBeenCalled();
  });

  it('submits the proof and shows a success state', async () => {
    uploadProofMock.mockResolvedValue({});
    render(<DeliveryProofUpload shipmentId="ship-1" />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, makeImageFile());
    await screen.findByText('proof.png');
    await userEvent.type(screen.getByLabelText('Recipient Name'), 'Jane Doe');

    const submitButton = screen.getByRole('button', { name: /submit proof/i });
    await waitFor(() => expect(submitButton).toBeEnabled());
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(uploadProofMock).toHaveBeenCalledWith('ship-1', expect.any(File), 'Jane Doe');
    });

    expect(
      await screen.findByText('Delivery proof submitted successfully')
    ).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows an error message when the upload fails', async () => {
    uploadProofMock.mockRejectedValue(new Error('network error'));
    render(<DeliveryProofUpload shipmentId="ship-1" />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, makeImageFile());
    await screen.findByText('proof.png');
    await userEvent.type(screen.getByLabelText('Recipient Name'), 'Jane Doe');

    const submitButton = screen.getByRole('button', { name: /submit proof/i });
    await waitFor(() => expect(submitButton).toBeEnabled());
    await userEvent.click(submitButton);

    expect(
      await screen.findByText('Failed to upload proof. Please try again.')
    ).toBeInTheDocument();
  });
});
