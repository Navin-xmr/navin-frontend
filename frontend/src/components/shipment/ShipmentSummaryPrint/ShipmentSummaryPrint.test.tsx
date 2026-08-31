import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ShipmentSummaryPrint, {
  type ShipmentSummaryPrintData,
} from './ShipmentSummaryPrint';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Minimal valid ShipmentSummaryPrintData */
function makeData(
  overrides: Partial<ShipmentSummaryPrintData> = {},
): ShipmentSummaryPrintData {
  return {
    shipmentId: 'SHP-0042',
    status: 'IN_TRANSIT',
    sender: { name: 'Acme Corp', address: '1 Sender St, London' },
    receiver: { name: 'Global Freight', address: '99 Receiver Ave, Paris' },
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ShipmentSummaryPrint', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // window.print is not implemented in jsdom — provide a spy
    vi.spyOn(window, 'print').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ── Portal rendering ───────────────────────────────────────────────────────

  describe('portal rendering', () => {
    it('renders the print root element into document.body via portal', () => {
      render(<ShipmentSummaryPrint data={makeData()} onClose={vi.fn()} />);
      expect(
        document.getElementById('shipment-summary-print-root'),
      ).toBeInTheDocument();
    });

    it('renders the NAVIN brand header', () => {
      render(<ShipmentSummaryPrint data={makeData()} onClose={vi.fn()} />);
      expect(screen.getByText('NAVIN')).toBeInTheDocument();
    });

    it('renders "SHIPMENT SUMMARY" heading', () => {
      render(<ShipmentSummaryPrint data={makeData()} onClose={vi.fn()} />);
      expect(screen.getByText('SHIPMENT SUMMARY')).toBeInTheDocument();
    });
  });

  // ── Shipment metadata ──────────────────────────────────────────────────────

  describe('shipment metadata', () => {
    it('renders the shipment ID', () => {
      render(<ShipmentSummaryPrint data={makeData()} onClose={vi.fn()} />);
      expect(screen.getByText('SHP-0042')).toBeInTheDocument();
    });

    it('renders the shipment status', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ status: 'DELIVERED' })}
          onClose={vi.fn()}
        />,
      );
      // formatStatus('DELIVERED') → 'DELIVERED' (no underscores, already uppercase)
      expect(screen.getByText('DELIVERED')).toBeInTheDocument();
    });

    it('renders sender name and address', () => {
      render(<ShipmentSummaryPrint data={makeData()} onClose={vi.fn()} />);
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('1 Sender St, London')).toBeInTheDocument();
    });

    it('renders receiver name and address', () => {
      render(<ShipmentSummaryPrint data={makeData()} onClose={vi.fn()} />);
      expect(screen.getByText('Global Freight')).toBeInTheDocument();
      expect(screen.getByText('99 Receiver Ave, Paris')).toBeInTheDocument();
    });

    it('renders the tracking number when provided', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ trackingNumber: 'TRK-9999' })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('TRK-9999')).toBeInTheDocument();
    });

    it('does not render tracking number section when absent', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ trackingNumber: undefined })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.queryByText('TRK-9999')).not.toBeInTheDocument();
    });

    it('renders createdAt and expectedDelivery dates when provided', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({
            createdAt: '2026-01-01',
            expectedDelivery: '2026-01-10',
          })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('2026-01-01')).toBeInTheDocument();
      expect(screen.getByText('2026-01-10')).toBeInTheDocument();
    });

    it('renders carrier when provided', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ carrier: 'FedEx Logistics' })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('FedEx Logistics')).toBeInTheDocument();
    });

    it('renders priority when provided', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ priority: 'High' })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  // ── Milestones ─────────────────────────────────────────────────────────────

  describe('milestone timeline section', () => {
    const milestones = [
      {
        name: 'Picked Up',
        timestamp: '2026-01-01 09:00',
        location: 'London',
        status: 'completed',
        blockchainAddress: 'GABC1234',
      },
      {
        name: 'In Transit',
        timestamp: '2026-01-02',
        location: 'Dover',
        status: 'current',
      },
    ];

    it('renders the milestone timeline section heading', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ milestones })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('Milestone Timeline')).toBeInTheDocument();
    });

    it('renders milestone event names', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ milestones })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('Picked Up')).toBeInTheDocument();
      expect(screen.getByText('In Transit')).toBeInTheDocument();
    });

    it('does not render the milestone section when milestones is empty', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ milestones: [] })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.queryByText('Milestone Timeline')).not.toBeInTheDocument();
    });
  });

  // ── Cost breakdown ─────────────────────────────────────────────────────────

  describe('cost breakdown section', () => {
    const costItems = [
      { label: 'Base Freight', amount: 450.0 },
      { label: 'Fuel Surcharge', amount: 50.0 },
      { label: 'Loyalty Discount', amount: 25.0, isDiscount: true },
    ];

    it('renders the cost breakdown section heading', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ costItems })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('Cost Breakdown')).toBeInTheDocument();
    });

    it('renders each cost item label', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ costItems })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('Base Freight')).toBeInTheDocument();
      expect(screen.getByText('Fuel Surcharge')).toBeInTheDocument();
      expect(screen.getByText('Loyalty Discount')).toBeInTheDocument();
    });

    it('renders the total cost row when totalCost is provided', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({
            costItems,
            totalCost: { amount: 475.0, currency: 'USD' },
          })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('USD 475.00')).toBeInTheDocument();
    });
  });

  // ── Payment info ──────────────────────────────────────────────────────────

  describe('payment info section', () => {
    it('renders payment amount and token symbol', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({
            costItems: [{ label: 'Freight', amount: 200 }],
            payment: {
              amount: '475.00',
              tokenSymbol: 'XLM',
              status: 'released',
            },
          })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('475.00 XLM')).toBeInTheDocument();
    });
  });

  // ── Sensor snapshot ───────────────────────────────────────────────────────

  describe('sensor snapshot section', () => {
    it('renders the IoT sensor snapshot heading when provided', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({
            sensorSnapshot: {
              temperature: { value: 4, unit: '°C' },
              humidity: { value: 65, unit: '%' },
            },
          })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText(/IoT Sensor Snapshot/i)).toBeInTheDocument();
    });

    it('renders temperature and humidity values', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({
            sensorSnapshot: {
              temperature: { value: 4, unit: '°C' },
              humidity: { value: 65, unit: '%' },
            },
          })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('4°C')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    it('renders GPS coordinates when location is provided', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({
            sensorSnapshot: {
              location: { latitude: 51.5074, longitude: -0.1278 },
            },
          })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('51.5074, -0.1278')).toBeInTheDocument();
    });
  });

  // ── Notes and delivery proof ──────────────────────────────────────────────

  describe('notes and delivery proof', () => {
    it('renders notes when provided', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ notes: 'Handle with care. Fragile items inside.' })}
          onClose={vi.fn()}
        />,
      );
      expect(
        screen.getByText('Handle with care. Fragile items inside.'),
      ).toBeInTheDocument();
    });

    it('renders proof of delivery when provided', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ deliveryProof: 'Signature confirmed by J. Smith' })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('Signature confirmed by J. Smith')).toBeInTheDocument();
      expect(screen.getByText('Proof of Delivery')).toBeInTheDocument();
    });

    it('renders Stellar TX hash when provided', () => {
      render(
        <ShipmentSummaryPrint
          data={makeData({ stellarTxHash: 'TXHASH123456789ABCDEF' })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('TXHASH123456789ABCDEF')).toBeInTheDocument();
    });
  });

  // ── Print + onClose lifecycle ─────────────────────────────────────────────

  describe('print and close lifecycle', () => {
    it('calls window.print() after 200 ms', () => {
      render(<ShipmentSummaryPrint data={makeData()} onClose={vi.fn()} />);
      expect(window.print).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);
      expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('calls onClose after window.print()', () => {
      const onClose = vi.fn();
      render(<ShipmentSummaryPrint data={makeData()} onClose={onClose} />);
      expect(onClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call window.print() or onClose before the 200 ms delay', () => {
      const onClose = vi.fn();
      render(<ShipmentSummaryPrint data={makeData()} onClose={onClose} />);

      vi.advanceTimersByTime(100); // still within delay
      expect(window.print).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('only calls window.print() once even if component re-renders', async () => {
      const onClose = vi.fn();
      const { rerender } = render(
        <ShipmentSummaryPrint data={makeData()} onClose={onClose} />,
      );

      rerender(
        <ShipmentSummaryPrint
          data={makeData({ status: 'DELIVERED' })}
          onClose={onClose}
        />,
      );

      vi.advanceTimersByTime(200);
      expect(window.print).toHaveBeenCalledTimes(1);
    });
  });
});
