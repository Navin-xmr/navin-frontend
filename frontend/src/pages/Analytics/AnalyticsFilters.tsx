import React, { useId, useMemo, useState } from "react";
import { format } from "date-fns";
import { SlidersHorizontal, X } from "lucide-react";
import { DateRangePicker } from "@components/ui/DateRangePicker";

export type ShipmentTypeFilter = "URGENT" | "STANDARD" | "ECONOMY";

export interface AnalyticsFiltersValues {
  startDate: string;
  endDate: string;
  regions: string[];
  shipmentTypes: ShipmentTypeFilter[];
}

interface AnalyticsFiltersProps {
  values: AnalyticsFiltersValues;
  onChange: (values: AnalyticsFiltersValues) => void;
  regionOptions: string[];
  disabled?: boolean;
}

const SHIPMENT_TYPE_OPTIONS: { value: ShipmentTypeFilter; label: string }[] = [
  { value: "URGENT", label: "Urgent" },
  { value: "STANDARD", label: "Standard" },
  { value: "ECONOMY", label: "Economy" },
];

const chipBase =
  "inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-medium transition-all cursor-pointer";

const toggleChip = (active: boolean) =>
  `${chipBase} ${
    active
      ? "bg-[rgba(59,130,246,0.15)] text-[#3b82f6] border-[#3b82f6]"
      : "bg-transparent text-[#94a3b8] border-[#1e293b] hover:border-[#3b82f6] hover:text-white"
  }`;

function countActive(f: AnalyticsFiltersValues): number {
  let c = 0;
  if (f.regions.length) c++;
  if (f.shipmentTypes.length) c++;
  return c;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  values,
  onChange,
  regionOptions,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  const activeCount = useMemo(() => countActive(values), [values]);

  const patch = (next: Partial<AnalyticsFiltersValues>) =>
    onChange({ ...values, ...next });

  const toggleRegion = (region: string) =>
    patch({
      regions: values.regions.includes(region)
        ? values.regions.filter((r) => r !== region)
        : [...values.regions, region],
    });

  const toggleShipmentType = (type: ShipmentTypeFilter) =>
    patch({
      shipmentTypes: values.shipmentTypes.includes(type)
        ? values.shipmentTypes.filter((t) => t !== type)
        : [...values.shipmentTypes, type],
    });

  const clearAll = () =>
    onChange({ ...values, regions: [], shipmentTypes: [] });

  return (
    <div className="flex flex-col gap-3 w-full md:w-auto">
      <div className="flex items-center gap-3 flex-wrap max-md:flex-col max-md:items-stretch">
        {/* Date Range Picker replaces the two plain date inputs */}
        <DateRangePicker
          value={{
            from: values.startDate ? new Date(values.startDate) : null,
            to: values.endDate ? new Date(values.endDate) : null,
          }}
          onChange={(r) =>
            patch({
              startDate: r.from ? format(r.from, "yyyy-MM-dd") : "",
              endDate: r.to ? format(r.to, "yyyy-MM-dd") : "",
            })
          }
          disabled={disabled}
        />

        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
            isOpen || activeCount > 0
              ? "bg-[rgba(59,130,246,0.1)] border-[#3b82f6] text-[#3b82f6]"
              : "bg-[#14171e] border-[#1e293b] text-[#94a3b8] hover:text-white hover:border-[#3b82f6]"
          }`}
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#3b82f6] text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {values.regions.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.3)] rounded-full text-xs text-[#3b82f6] font-medium">
              Region: {values.regions.join(", ")}
              <button
                type="button"
                onClick={() => patch({ regions: [] })}
                className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.15)] hover:text-white transition-colors"
                aria-label="Remove region filter"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {values.shipmentTypes.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.3)] rounded-full text-xs text-[#3b82f6] font-medium">
              Type:{" "}
              {values.shipmentTypes
                .map((t) => t.charAt(0) + t.slice(1).toLowerCase())
                .join(", ")}
              <button
                type="button"
                onClick={() => patch({ shipmentTypes: [] })}
                className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.15)] hover:text-white transition-colors"
                aria-label="Remove shipment type filter"
              >
                <X size={10} />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1 text-xs text-[#64748b] hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {isOpen && (
        <div
          id={panelId}
          className="p-4 bg-[#14171e] border border-[#1e293b] rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <span className="block text-xs text-[#64748b] mb-2 font-medium uppercase tracking-wider">
              Region
            </span>
            {regionOptions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {regionOptions.map((region) => (
                  <label
                    key={region}
                    className={toggleChip(values.regions.includes(region))}
                  >
                    <input
                      type="checkbox"
                      checked={values.regions.includes(region)}
                      onChange={() => toggleRegion(region)}
                      className="sr-only"
                    />
                    {region}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748b]">
                No regions available for the selected period.
              </p>
            )}
          </div>

          <div>
            <span className="block text-xs text-[#64748b] mb-2 font-medium uppercase tracking-wider">
              Shipment Type
            </span>
            <div className="flex flex-wrap gap-2">
              {SHIPMENT_TYPE_OPTIONS.map(({ value, label }) => (
                <label
                  key={value}
                  className={toggleChip(values.shipmentTypes.includes(value))}
                >
                  <input
                    type="checkbox"
                    checked={values.shipmentTypes.includes(value)}
                    onChange={() => toggleShipmentType(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilters;
