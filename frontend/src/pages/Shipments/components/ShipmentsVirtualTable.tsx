import React from 'react';
import { Package } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Shipment } from '../../../api/shipmentApi';
import PriorityBadge from '@components/ui/PriorityBadge';
import StatusBadge from '../../../components/ui/StatusBadge/StatusBadge';
import { safeFormatDate } from '../../../utils/safeFormat';

// Shared Tailwind class string for both the sticky header table and the
// scrollable virtual table, kept as a constant to avoid duplication.
const TABLE_CLASS =
  'w-full mt-4 border-collapse text-inherit [&_th]:px-3 [&_th]:py-2.5 [&_th]:border-b [&_th]:border-[var(--border-color)] [&_th]:text-left [&_th]:leading-[1.35] [&_th]:align-middle [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.02em] [&_th]:text-xs [&_th]:whitespace-nowrap [&_td]:px-3 [&_td]:py-2.5 [&_td]:border-b [&_td]:border-[var(--border-color)] [&_td]:text-left [&_td]:leading-[1.35] [&_td]:align-middle [&_td]:[overflow-wrap:anywhere]';

type VirtualizerInstance = ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>;

interface ShipmentsVirtualTableProps {
  shipments: Shipment[];
  total: number;
  isLoading: boolean;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  visibleIds: string[];
  parentRef: React.RefObject<HTMLDivElement>;
  virtualItems: ReturnType<VirtualizerInstance['getVirtualItems']>;
  totalSize: number;
  virtualizer: VirtualizerInstance;
  isSelected: (id: string) => boolean;
  toggleOne: (id: string) => void;
  toggleAll: (ids: string[]) => void;
  onRowClick: (id: string, index: number) => void;
  onScroll: React.UIEventHandler<HTMLDivElement>;
}

const ShipmentsVirtualTable: React.FC<ShipmentsVirtualTableProps> = ({
  shipments,
  total,
  isLoading,
  allVisibleSelected,
  someVisibleSelected,
  visibleIds,
  parentRef,
  virtualItems,
  totalSize,
  virtualizer,
  isSelected,
  toggleOne,
  toggleAll,
  onRowClick,
  onScroll,
}) => (
  <>
    <div className="text-sm text-[#94a3b8] mb-3">
      Showing {shipments.length}
      {` of ${total}`} shipments
    </div>

    {/* Sticky column-header table — mirrors the scrollable table's layout */}
    <table
      className={TABLE_CLASS}
      style={{ tableLayout: 'fixed', width: '100%' }}
    >
      <thead>
        <tr>
          <th style={{ width: '40px' }}>
            <input
              type="checkbox"
              aria-label="Select all visible shipments"
              checked={allVisibleSelected}
              ref={(element) => {
                if (element) element.indeterminate = someVisibleSelected;
              }}
              onChange={() => toggleAll(visibleIds)}
              className="cursor-pointer accent-[#62ffff] w-4 h-4"
            />
          </th>
          <th>Shipment ID</th>
          <th>Origin</th>
          <th>Destination</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Created Date</th>
          <th>Actions</th>
        </tr>
      </thead>
    </table>

    {/* Scrollable virtualised body */}
    <div
      ref={parentRef}
      onScroll={onScroll}
      style={{ height: '500px', overflowY: 'auto', position: 'relative' }}
    >
      <table
        className={TABLE_CLASS}
        style={{ tableLayout: 'fixed', width: '100%' }}
        aria-label="Shipments list"
      >
        <tbody
          style={{
            display: 'block',
            height: `${totalSize}px`,
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const shipment = shipments[virtualRow.index];
            if (!shipment) return null;
            const selected = isSelected(shipment.id);

            return (
              <tr
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                aria-selected={selected}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'table',
                  tableLayout: 'fixed',
                  background: selected ? 'rgba(98,255,255,0.06)' : undefined,
                }}
              >
                <td style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    aria-label={`Select shipment ${shipment.id}`}
                    checked={selected}
                    onChange={() => toggleOne(shipment.id)}
                    onClick={(event) => event.stopPropagation()}
                    className="cursor-pointer accent-[#62ffff] w-4 h-4"
                  />
                </td>
                <td>
                  <span className="inline-flex items-center gap-1.5">
                    <Package size={14} className="text-[#62ffff]" />
                    {shipment.id}
                  </span>
                </td>
                <td>{shipment.origin}</td>
                <td>{shipment.destination}</td>
                <td>
                  <StatusBadge status={shipment.status} />
                </td>
                <td>
                  {shipment.priority ? (
                    <PriorityBadge priority={shipment.priority} />
                  ) : (
                    <span className="text-[#64748b]">N/A</span>
                  )}
                </td>
                <td>{safeFormatDate(shipment.createdAt)}</td>
                <td>
                  <button
                    type="button"
                    className="rounded-lg bg-[#62ffff] px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-[#4ae8e8]"
                    onClick={() => onRowClick(shipment.id, virtualRow.index)}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {isLoading && (
      <div
        className="py-8 px-6 text-center text-[var(--text-secondary)]"
        aria-live="polite"
      >
        Loading more shipments...
      </div>
    )}
  </>
);

export default ShipmentsVirtualTable;
