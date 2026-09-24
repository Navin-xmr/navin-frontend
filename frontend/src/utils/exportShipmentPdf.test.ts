import { beforeEach, describe, expect, it, vi } from 'vitest';

const { html2pdfMock, setMock, fromMock, saveMock } = vi.hoisted(() => {
  const saveMock = vi.fn();
  const fromMock = vi.fn(() => ({ save: saveMock }));
  const setMock = vi.fn(() => ({ from: fromMock }));
  const html2pdfMock = vi.fn(() => ({ set: setMock }));
  return { html2pdfMock, setMock, fromMock, saveMock };
});

vi.mock('html2pdf.js', () => ({ default: html2pdfMock }));

import { exportShipmentPdf } from './exportShipmentPdf';

describe('exportShipmentPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveMock.mockResolvedValue(undefined);
  });

  it('throws when the container ref is empty', async () => {
    await expect(exportShipmentPdf('TRK-1', { current: null })).rejects.toThrow(
      'Shipment content is not available to export.',
    );
    expect(html2pdfMock).not.toHaveBeenCalled();
  });

  it('generates a PDF named after the tracking number from the container element', async () => {
    const element = document.createElement('div');

    await exportShipmentPdf('TRK-123', { current: element });

    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({ filename: 'shipment-TRK-123.pdf' }),
    );
    expect(fromMock).toHaveBeenCalledWith(element);
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('rethrows the PDF library error message', async () => {
    saveMock.mockRejectedValue(new Error('canvas failed'));

    await expect(
      exportShipmentPdf('TRK-1', { current: document.createElement('div') }),
    ).rejects.toThrow('canvas failed');
  });

  it('uses a fallback message when the PDF library rejects with a non-Error', async () => {
    saveMock.mockRejectedValue('boom');

    await expect(
      exportShipmentPdf('TRK-1', { current: document.createElement('div') }),
    ).rejects.toThrow('Failed to generate shipment PDF.');
  });
});
