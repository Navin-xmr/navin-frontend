import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DocumentsSection from './DocumentsSection';

const { mockGetDocuments, mockAddToast } = vi.hoisted(() => ({ mockGetDocuments: vi.fn(), mockAddToast: vi.fn() }));
vi.mock('../../../services/api/endpoints/shipments', () => ({ shipmentApi: { getDocuments: mockGetDocuments, uploadDocument: vi.fn() } }));
vi.mock('../../../context/ToastContext', () => ({ useToast: () => ({ addToast: mockAddToast }) }));

describe('DocumentsSection', () => {
  it('loads and renders the shipment document list', async () => {
    mockGetDocuments.mockResolvedValue([
      { id: 'doc-1', name: 'bill.pdf', type: 'BILL_OF_LADING', url: 'https://example.com/bill.pdf', uploadedAt: '2026-01-01T00:00:00Z', size: 1024 },
      { id: 'doc-2', name: 'invoice.pdf', type: 'COMMERCIAL_INVOICE', url: 'https://example.com/invoice.pdf', uploadedAt: '2026-01-02T00:00:00Z', size: 2048 },
    ]);
    render(<DocumentsSection shipmentId="SHP-1" userRole="customer" />);
    expect(await screen.findByText('bill.pdf')).toBeInTheDocument();
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
    expect(mockGetDocuments).toHaveBeenCalledWith('SHP-1');
  });

  it('does not show the upload controls for a customer', async () => {
    mockGetDocuments.mockResolvedValue([]);
    render(<DocumentsSection shipmentId="SHP-1" userRole="customer" />);
    await waitFor(() => expect(mockGetDocuments).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /upload document/i })).not.toBeInTheDocument();
  });
});
