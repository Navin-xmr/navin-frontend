import type { ShipmentPriority } from '../../../api/shipmentApi';
import SearchInput from '../../../components/ui/SearchInput';
import ShipmentFilters, { type ShipmentFiltersValues, type ShipmentStatus } from '../ShipmentFilters';

export type TopStatusFilter = 'ALL' | ShipmentStatus;
export type TopPriorityFilter = 'ALL' | ShipmentPriority;
export type TopTimeframeFilter = 'ALL' | '30' | '90';

interface ShipmentsFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: TopStatusFilter;
  onStatusChange: (value: TopStatusFilter) => void;
  priorityFilter: TopPriorityFilter;
  onPriorityChange: (value: TopPriorityFilter) => void;
  timeframeFilter: TopTimeframeFilter;
  onTimeframeChange: (value: TopTimeframeFilter) => void;
  onAdvancedChange: (values: ShipmentFiltersValues) => void;
}

const selectClass =
  'bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#62ffff] cursor-pointer';
const optionClass = 'bg-[#121620]';

/**
 * Filter toolbar for the shipments list — search box plus the top-level
 * status/priority/timeframe selects and the advanced filter sheet.
 *
 * Extracted from the Shipments page (issue #635) so the page owns only the
 * data flow and the toolbar owns its own markup.
 */
export function ShipmentsFilterToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  timeframeFilter,
  onTimeframeChange,
  onAdvancedChange,
}: ShipmentsFilterToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
      <div className="flex-1 min-w-[280px]">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by ID, origin, or destination..."
        />
      </div>

      <select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value as TopStatusFilter)}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="ALL" className={optionClass}>All Statuses</option>
        <option value="CREATED" className={optionClass}>Created</option>
        <option value="IN_TRANSIT" className={optionClass}>In Transit</option>
        <option value="DELIVERED" className={optionClass}>Delivered</option>
        <option value="CANCELLED" className={optionClass}>Cancelled</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(event) => onPriorityChange(event.target.value as TopPriorityFilter)}
        className={selectClass}
        aria-label="Filter by priority"
      >
        <option value="ALL" className={optionClass}>All Priorities</option>
        <option value="URGENT" className={optionClass}>Urgent</option>
        <option value="STANDARD" className={optionClass}>Standard</option>
        <option value="ECONOMY" className={optionClass}>Economy</option>
      </select>

      <select
        value={timeframeFilter}
        onChange={(event) => onTimeframeChange(event.target.value as TopTimeframeFilter)}
        className={selectClass}
        aria-label="Filter by timeframe"
      >
        <option value="ALL" className={optionClass}>All Time</option>
        <option value="30" className={optionClass}>Last 30 Days</option>
        <option value="90" className={optionClass}>Last 90 Days</option>
      </select>

      <ShipmentFilters onFilterChange={onAdvancedChange} />
    </div>
  );
}

export default ShipmentsFilterToolbar;