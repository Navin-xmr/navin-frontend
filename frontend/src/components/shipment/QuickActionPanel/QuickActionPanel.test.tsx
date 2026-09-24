import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import QuickActionPanel from './QuickActionPanel';

const updateStatusMock = vi.fn();
const updatePriorityMock = vi.fn();
const getDocumentsMock = vi.fn();

vi.mock('../../../services/api/endpoints/shipments', async () => {
  const actual = await vi.importActual<typeof import('../../../services/api/endpoints/shipments')>(
    '../../../services/api/endpoints/shipments'
  );
  return {
    ...actual,
    shipmentApi: {
      ...actual.shipmentApi,
      updateStatus: (...args: Parameters<typeof actual.shipmentApi.updateStatus>) =>
        updateStatusMock(...args),
      updatePriority: (...args: Parameters<typeof actual.shipmentApi.updatePriority>) =>
        updatePriorityMock(...args),
      getDocuments: (...args: Parameters<typeof actual.shipmentApi.getDocuments>) =>
        getDocumentsMock(...args),
    },
  };
});

describe('QuickActionPanel', () => {
  beforeEach(() => {
    updateStatusMock.mockReset();
    updatePriorityMock.mockReset();
    getDocumentsMock.mockReset();
    // Prevent real anchor navigation when documents are "downloaded".
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('marks a shipment as delivered via the API and shows success', async () => {
    updateStatusMock.mockResolvedValue({});
    render(<QuickActionPanel shipmentId="ship-1" />);

    await userEvent.click(screen.getByRole('button', { name: /mark shipment ship-1 as delivered/i }));

    await waitFor(() => expect(updateStatusMock).toHaveBeenCalledWith('ship-1', 'DELIVERED'));
    expect(await screen.findByText('Success!')).toBeInTheDocument();
  });

  it('surfaces a real server error when the API call fails', async () => {
    updateStatusMock.mockRejectedValue(new Error('Shipment already delivered'));
    render(<QuickActionPanel shipmentId="ship-1" />);

    await userEvent.click(screen.getByRole('button', { name: /mark shipment ship-1 as delivered/i }));

    const errorMatches = await screen.findAllByText(/Shipment already delivered/i);
    expect(errorMatches.length).toBeGreaterThan(0);
  });

  it('flags a shipment as priority via the API', async () => {
    updatePriorityMock.mockResolvedValue({});
    render(<QuickActionPanel shipmentId="ship-1" />);

    await userEvent.click(screen.getByRole('button', { name: /flag shipment ship-1 as priority/i }));

    await waitFor(() => expect(updatePriorityMock).toHaveBeenCalledWith('ship-1', 'URGENT'));
  });

  it('advances a CREATED shipment to IN_TRANSIT', async () => {
    updateStatusMock.mockResolvedValue({});
    render(<QuickActionPanel shipmentId="ship-1" currentStatus="CREATED" />);

    await userEvent.click(screen.getByRole('button', { name: /update status for shipment ship-1/i }));

    await waitFor(() => expect(updateStatusMock).toHaveBeenCalledWith('ship-1', 'IN_TRANSIT'));
  });

  it('does not advance a shipment that is already in a final status', async () => {
    render(<QuickActionPanel shipmentId="ship-1" currentStatus="DELIVERED" />);

    await userEvent.click(screen.getByRole('button', { name: /update status for shipment ship-1/i }));

    const errorMatches = await screen.findAllByText(/already in its final status/i);
    expect(errorMatches.length).toBeGreaterThan(0);
    expect(updateStatusMock).not.toHaveBeenCalled();
  });

  it('fetches the shipment documents when downloading', async () => {
    getDocumentsMock.mockResolvedValue([
      { id: 'doc-1', name: 'BOL.pdf', url: 'https://example.com/bol.pdf' },
    ]);
    render(<QuickActionPanel shipmentId="ship-1" />);

    await userEvent.click(
      screen.getByRole('button', { name: /download documents for shipment ship-1/i })
    );

    await waitFor(() => expect(getDocumentsMock).toHaveBeenCalledWith('ship-1'));
    expect(await screen.findByText('Success!')).toBeInTheDocument();
  });

  it('reports when no documents are available to download', async () => {
    getDocumentsMock.mockResolvedValue([]);
    render(<QuickActionPanel shipmentId="ship-1" />);

    await userEvent.click(
      screen.getByRole('button', { name: /download documents for shipment ship-1/i })
    );

    const errorMatches = await screen.findAllByText(/No documents are available/i);
    expect(errorMatches.length).toBeGreaterThan(0);
  });

  it('shares the tracking link via the native share API', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, share: shareMock });
    render(<QuickActionPanel shipmentId="ship-1" />);

    await userEvent.click(
      screen.getByRole('button', { name: /share tracking link for shipment ship-1/i })
    );

    await waitFor(() => expect(shareMock).toHaveBeenCalled());
    expect(shareMock).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'http://localhost:3000/tracking/ship-1' })
    );
  });

  it('opens the support contact with the shipment id', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<QuickActionPanel shipmentId="ship-1" />);

    await userEvent.click(
      screen.getByRole('button', { name: /contact support about shipment ship-1/i })
    );

    await waitFor(() => expect(openSpy).toHaveBeenCalled());
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('mailto:support@navin.io'),
      '_blank'
    );
    expect(await screen.findByText('Success!')).toBeInTheDocument();
  });
});
