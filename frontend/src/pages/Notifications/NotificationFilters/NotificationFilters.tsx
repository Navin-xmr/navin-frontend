import { ArrowUpDown, AlignJustify, List as ListIcon } from "lucide-react";
import SearchInput from "@components/ui/SearchInput";
import type { useNotificationPreferences } from "../hooks/useNotificationPreferences";
import type { NotificationFilterType, ReadStateFilter, SortMode } from "../types";

export interface NotificationFiltersProps {
  preferences: ReturnType<typeof useNotificationPreferences>;
  filterCounts: Record<NotificationFilterType, number>;
  readStateCounts: Record<ReadStateFilter, number>;
  isLoading: boolean;
}

const readStateFilters: { key: ReadStateFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

const filters: { key: NotificationFilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "shipments", label: "Shipments" },
  { key: "settlements", label: "Settlements" },
  { key: "system", label: "System" },
];

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "unreadFirst", label: "Unread First" },
];

const NotificationFilters = ({ preferences, filterCounts, readStateCounts, isLoading }: NotificationFiltersProps) => {
  const {
    activeFilter,
    handleFilterChange,
    searchQuery,
    setSearchQuery,
    readStateFilter,
    setReadStateFilter,
    sortMode,
    setSortMode,
    isGrouped,
    setIsGrouped,
    notifDensity,
    handleNotifDensityChange,
  } = preferences;

  return (
    <>
      <div className="flex justify-between items-center mb-8 gap-6 border-b border-[#283039] pb-5 flex-wrap">
        <div className="flex gap-2 flex-wrap items-center">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              className={`px-4 py-2.5 border-none rounded-[20px] text-sm cursor-pointer transition-all flex items-center gap-2 ${
                activeFilter === key
                  ? "bg-[#2563eb] text-white"
                  : "bg-transparent text-text-secondary hover:bg-[#1f2937] hover:text-white"
              }`}
              onClick={() => handleFilterChange(key)}
            >
              {label}
              <span className="bg-[rgba(255,255,255,0.2)] px-2 py-0.5 rounded-xl text-xs font-semibold">
                {filterCounts[key]}
              </span>
            </button>
          ))}
          <div className="w-px h-6 bg-[#283039]" aria-hidden="true" />
          {/* Sort Controls */}
          <div className="flex gap-1 bg-[#1a1f2e] rounded-lg p-[3px]" role="group" aria-label="Sort notifications">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`border-none text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all flex items-center gap-1 ${
                  sortMode === opt.value
                    ? "bg-[#2563eb] text-white"
                    : "bg-transparent text-text-secondary hover:text-white"
                }`}
                onClick={() => setSortMode(opt.value)}
              >
                <ArrowUpDown size={12} />
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`px-4 py-2.5 border-none rounded-[20px] text-sm cursor-pointer transition-all ${
              isGrouped
                ? "bg-[#2563eb] text-white"
                : "bg-transparent text-text-secondary hover:bg-[#1f2937] hover:text-white"
            }`}
            onClick={() => setIsGrouped((prev) => !prev)}
          >
            {isGrouped ? "Grouped" : "Ungrouped"}
          </button>

          {/* Density toggle */}
          <div
            className="inline-flex items-center rounded-lg bg-[#1a1f2e] p-[3px]"
            role="group"
            aria-label="Toggle notification density"
          >
            <button
              type="button"
              aria-pressed={notifDensity === "comfortable"}
              title="Comfortable view"
              onClick={() => handleNotifDensityChange("comfortable")}
              className={`border-none text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all flex items-center gap-1 ${
                notifDensity === "comfortable"
                  ? "bg-[#2563eb] text-white"
                  : "bg-transparent text-text-secondary hover:text-white"
              }`}
            >
              <AlignJustify size={12} />
              Default
            </button>
            <button
              type="button"
              aria-pressed={notifDensity === "compact"}
              title="Compact view"
              onClick={() => handleNotifDensityChange("compact")}
              className={`border-none text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all flex items-center gap-1 ${
                notifDensity === "compact"
                  ? "bg-[#2563eb] text-white"
                  : "bg-transparent text-text-secondary hover:text-white"
              }`}
            >
              <ListIcon size={12} />
              Compact
            </button>
          </div>
        </div>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by ID, contract, or keyword..."
          isLoading={isLoading}
        />
      </div>

      <div
        role="tablist"
        aria-label="Filter by read state"
        className="flex gap-2 mb-6"
      >
        {readStateFilters.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={readStateFilter === key}
            className={`px-3.5 py-2 rounded-lg text-sm cursor-pointer transition-all flex items-center gap-2 border ${
              readStateFilter === key
                ? "bg-[rgba(37,99,235,0.15)] border-[#2563eb] text-white"
                : "bg-transparent border-[#283039] text-text-secondary hover:border-[#4b5563] hover:text-white"
            }`}
            onClick={() => setReadStateFilter(key)}
          >
            {label}
            <span className="bg-[rgba(255,255,255,0.1)] px-2 py-0.5 rounded-xl text-xs font-semibold">
              {readStateCounts[key]}
            </span>
          </button>
        ))}
      </div>
    </>
  );
};

export default NotificationFilters;
