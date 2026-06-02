import React, { useState } from 'react';
import DataTable from './DataTable';
import type { ColumnDef, PaginationConfig } from './types';

// --- Dataset 1: Shipments ---

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: string;
  weight: number;
  date: string;
}

const shipmentColumns: ColumnDef<Shipment & Record<string, unknown>>[] = [
  { key: 'id', label: 'Shipment ID', sortable: true },
  { key: 'origin', label: 'Origin', sortable: true },
  { key: 'destination', label: 'Destination', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (value) => (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase bg-accent-blue/10 text-blue-400">
        {String(value)}
      </span>
    ),
  },
  { key: 'weight', label: 'Weight (kg)', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
];

const shipmentData: (Shipment & Record<string, unknown>)[] = [
  { id: 'SHP-001', origin: 'Lagos', destination: 'Nairobi', status: 'In Transit', weight: 120, date: '2026-03-01' },
  { id: 'SHP-002', origin: 'Accra', destination: 'Cairo', status: 'Delivered', weight: 85, date: '2026-03-03' },
  { id: 'SHP-003', origin: 'Dakar', destination: 'Johannesburg', status: 'Pending', weight: 200, date: '2026-03-05' },
  { id: 'SHP-004', origin: 'Nairobi', destination: 'Lagos', status: 'In Transit', weight: 60, date: '2026-03-07' },
  { id: 'SHP-005', origin: 'Cairo', destination: 'Accra', status: 'Delivered', weight: 150, date: '2026-03-09' },
  { id: 'SHP-006', origin: 'Abuja', destination: 'Dakar', status: 'Pending', weight: 95, date: '2026-03-11' },
];

// --- Dataset 2: Settlements ---

interface Settlement {
  txHash: string;
  amount: number;
  token: string;
  status: string;
  timestamp: string;
}

const settlementColumns: ColumnDef<Settlement & Record<string, unknown>>[] = [
  {
    key: 'txHash',
    label: 'Tx Hash',
    render: (value) => (
      <span className="font-mono text-xs text-text-secondary">
        {String(value).slice(0, 10)}…
      </span>
    ),
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    render: (value, row) => (
      <span className="font-semibold">
        {Number(value).toLocaleString()} {String(row.token)}
      </span>
    ),
  },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'timestamp', label: 'Timestamp', sortable: true },
];

const settlementData: (Settlement & Record<string, unknown>)[] = [
  { txHash: '0xabc123def456', amount: 5420, token: 'USDC', status: 'Released', timestamp: '2026-03-01 10:22' },
  { txHash: '0x789xyz012uvw', amount: 3200, token: 'XLM', status: 'Escrowed', timestamp: '2026-03-02 14:05' },
  { txHash: '0xfed321cba654', amount: 7850, token: 'USDC', status: 'Released', timestamp: '2026-03-03 09:47' },
  { txHash: '0x111aaa222bbb', amount: 1250, token: 'USDC', status: 'Pending', timestamp: '2026-03-04 16:30' },
];

// --- Example Component ---

const ITEMS_PER_PAGE = 3;

const DataTableExample: React.FC = () => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const paginatedShipments = shipmentData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const pagination: PaginationConfig = {
    currentPage: page,
    totalPages: Math.ceil(shipmentData.length / ITEMS_PER_PAGE),
    onPageChange: setPage,
    totalItems: shipmentData.length,
    itemsPerPage: ITEMS_PER_PAGE,
  };

  return (
    <div className="p-8 flex flex-col gap-10 bg-background min-h-screen">
      <section>
        <h2 className="text-xl font-bold text-text-primary mb-4">Shipments (with pagination + row click)</h2>
        <button
          onClick={() => setLoading((v) => !v)}
          className="mb-4 px-4 py-2 text-sm border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors"
        >
          Toggle loading: {loading ? 'ON' : 'OFF'}
        </button>
        <DataTable
          columns={shipmentColumns}
          data={paginatedShipments}
          loading={loading}
          pagination={pagination}
          onRowClick={(row) => alert(`Clicked: ${row.id}`)}
          emptyState={{
            message: 'No shipments found',
            description: 'Create your first shipment to get started.',
            cta: { label: 'Create Shipment', onClick: () => alert('Create!') },
          }}
        />
      </section>

      <section>
        <h2 className="text-xl font-bold text-text-primary mb-4">Settlements (no pagination)</h2>
        <DataTable
          columns={settlementColumns}
          data={settlementData}
          onRowClick={(row) => alert(`Tx: ${row.txHash}`)}
          emptyState={{ message: 'No settlements yet' }}
        />
      </section>

      <section>
        <h2 className="text-xl font-bold text-text-primary mb-4">Empty state demo</h2>
        <DataTable
          columns={shipmentColumns}
          data={[]}
          emptyState={{
            message: 'No shipments found',
            description: 'Try adjusting your filters.',
            cta: { label: 'Clear Filters', onClick: () => {} },
          }}
        />
      </section>
    </div>
  );
};

export default DataTableExample;
