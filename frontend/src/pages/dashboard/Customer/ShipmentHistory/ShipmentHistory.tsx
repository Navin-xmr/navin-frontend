import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowUpDown, Search, Star, Eye, Package } from "lucide-react";

interface HistoricalShipment {
  id: string;
  origin: string;
  destination: string;
  deliveredDate: string;
  rating: number | null; // 1-5 stars, null if not rated
}

const MOCK_SHIPMENT_HISTORY: HistoricalShipment[] = [
  { id: "SHP-7001", origin: "Singapore", destination: "Los Angeles", deliveredDate: "2026-02-20", rating: 5 },
  { id: "SHP-6892", origin: "Dubai", destination: "London", deliveredDate: "2026-02-18", rating: 4 },
  { id: "SHP-6754", origin: "Shanghai", destination: "Rotterdam", deliveredDate: "2026-02-15", rating: 5 },
  { id: "SHP-6621", origin: "Mumbai", destination: "New York", deliveredDate: "2026-02-12", rating: 3 },
  { id: "SHP-6503", origin: "Tokyo", destination: "Sydney", deliveredDate: "2026-02-10", rating: null },
  { id: "SHP-6412", origin: "Hong Kong", destination: "Vancouver", deliveredDate: "2026-02-08", rating: 5 },
  { id: "SHP-6298", origin: "Seoul", destination: "Hamburg", deliveredDate: "2026-02-05", rating: 4 },
  { id: "SHP-6187", origin: "Bangkok", destination: "Miami", deliveredDate: "2026-02-02", rating: 5 },
  { id: "SHP-6054", origin: "Jakarta", destination: "Seattle", deliveredDate: "2026-01-28", rating: 2 },
  { id: "SHP-5921", origin: "Manila", destination: "Chicago", deliveredDate: "2026-01-25", rating: 4 },
  { id: "SHP-5803", origin: "Taipei", destination: "Boston", deliveredDate: "2026-01-22", rating: 5 },
  { id: "SHP-5692", origin: "Ho Chi Minh", destination: "San Francisco", deliveredDate: "2026-01-18", rating: null },
];

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateString));

const StarRating: React.FC<{ rating: number | null }> = ({ rating }) => {
  if (rating === null) {
    return <span className="text-text-secondary text-xs italic">Not rated</span>;
  }
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "fill-[#fbbf24] text-[#fbbf24]" : "fill-transparent text-[rgba(255,255,255,0.2)]"}
        />
      ))}
    </div>
  );
};

const ShipmentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter by search query (shipment ID)
  const filteredShipments = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_SHIPMENT_HISTORY;
    return MOCK_SHIPMENT_HISTORY.filter((shipment) =>
      shipment.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Sort by delivered date
  const sortedShipments = useMemo(() => {
    return [...filteredShipments].sort((a, b) => {
      const diff = new Date(a.deliveredDate).getTime() - new Date(b.deliveredDate).getTime();
      return sortOrder === "desc" ? -diff : diff;
    });
  }, [filteredShipments, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedShipments.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = sortedShipments.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
  };

  const tableContainerClass =
    "bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl overflow-hidden mb-5 shadow-[inset_0_0_20px_0px_rgba(0,128,128,0.3)]";
  const thClass =
    "text-left px-6 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]";
  const tdClass = "px-6 py-4 text-sm border-b border-[rgba(98,255,255,0.2)]";

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 md:p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Shipment History</h1>
          <p className="text-text-secondary text-sm">View all your past delivered shipments</p>
        </div>
        <div className={`${tableContainerClass} p-6`}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_0.5fr] gap-6 mb-4">
              {[...Array(6)].map((__, j) => (
                <div key={j} className="h-5 rounded animate-shimmer-teal" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (sortedShipments.length === 0 && !searchQuery) {
    return (
      <div className="p-6 md:p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Shipment History</h1>
          <p className="text-text-secondary text-sm">View all your past delivered shipments</p>
        </div>
        <div className={`${tableContainerClass} px-10 py-20 text-center`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(98,255,255,0.1)] flex items-center justify-center">
            <Package size={32} className="text-[#62ffff]" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[#62ffff]">No Shipment History</h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            You don&apos;t have any completed shipments yet. Once your shipments are delivered, they will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 lg:flex-col lg:gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 sm:text-xl">Shipment History</h1>
          <p className="text-text-secondary text-sm">View all your past delivered shipments</p>
        </div>

        {/* Search */}
        <div className="relative lg:w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by Shipment ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-[rgba(19,186,186,0.1)] border border-[rgba(98,255,255,0.2)] text-text-primary pl-10 pr-4 py-2 rounded-lg text-sm font-medium outline-none w-64 lg:w-full placeholder:text-text-secondary hover:border-[#62ffff] focus:border-[#62ffff] focus:bg-[rgba(19,186,186,0.15)] transition-colors"
          />
        </div>
      </div>

      {/* No results for search */}
      {sortedShipments.length === 0 && searchQuery && (
        <div className={`${tableContainerClass} px-10 py-12 text-center`}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[rgba(98,255,255,0.1)] flex items-center justify-center">
            <Search size={24} className="text-[#62ffff]" />
          </div>
          <h2 className="text-lg font-bold mb-2 text-[#62ffff]">No Results Found</h2>
          <p className="text-text-secondary text-sm">
            No shipments match &quot;{searchQuery}&quot;. Try a different search term.
          </p>
        </div>
      )}

      {/* Table */}
      {sortedShipments.length > 0 && (
        <>
          <div className={`${tableContainerClass} md:overflow-x-auto`}>
            <table className="w-full border-collapse md:min-w-175">
              <thead className="bg-[rgba(19,186,186,0.1)]">
                <tr>
                  <th className={thClass}>Shipment ID</th>
                  <th className={thClass}>Origin</th>
                  <th className={thClass}>Destination</th>
                  <th
                    className={`${thClass} cursor-pointer select-none`}
                    onClick={toggleSortOrder}
                  >
                    <span className="inline-flex items-center gap-2">
                      Delivered Date <ArrowUpDown size={14} />
                    </span>
                  </th>
                  <th className={thClass}>Rating</th>
                  <th className={thClass}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedShipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className="hover:bg-[rgba(98,255,255,0.05)] transition-colors"
                  >
                    <td className={`${tdClass} font-semibold text-[#62ffff]`}>{shipment.id}</td>
                    <td className={`${tdClass} text-text-primary`}>{shipment.origin}</td>
                    <td className={`${tdClass} text-text-primary`}>{shipment.destination}</td>
                    <td className={`${tdClass} text-text-secondary`}>
                      {formatDate(shipment.deliveredDate)}
                    </td>
                    <td className={tdClass}>
                      <StarRating rating={shipment.rating} />
                    </td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/shipments/${shipment.id}`)}
                        className="bg-transparent border border-[rgba(98,255,255,0.3)] text-[#62ffff] px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-all hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff]"
                      >
                        <Eye size={14} />
                        View Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-6 py-4 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-xl shadow-[inset_0_0_15px_0px_rgba(0,128,128,0.2)] md:flex-col md:gap-4">
            <div className="text-sm text-text-secondary">
              Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, sortedShipments.length)} of{" "}
              {sortedShipments.length}
            </div>
            <div className="flex gap-2 md:w-full md:justify-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-9 transition-all hover:not-disabled:bg-[rgba(98,255,255,0.1)] hover:not-disabled:border-[#62ffff] hover:not-disabled:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`border px-3 py-2 rounded-md text-sm font-semibold cursor-pointer min-w-9 transition-all ${
                    currentPage === i + 1
                      ? "bg-[#62ffff] border-[#62ffff] text-black"
                      : "bg-transparent border-[rgba(98,255,255,0.2)] text-text-primary hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-9 transition-all hover:not-disabled:bg-[rgba(98,255,255,0.1)] hover:not-disabled:border-[#62ffff] hover:not-disabled:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShipmentHistory;