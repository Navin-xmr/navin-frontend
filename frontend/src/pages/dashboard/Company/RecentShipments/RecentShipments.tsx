import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { shipmentApi, type Shipment } from '../../../../api/shipmentApi';
import './RecentShipments.css';

type SortKey = 'createdAt' | 'status';
type SortDirection = 'asc' | 'desc';

interface RecentShipmentsProps {
  shipments?: Shipment[];
  loadingDelayMs?: number;
}

const PAGE_SIZE = 5;

const statusRank: Record<Shipment['status'], number> = {
  'Pending Approval': 1,
  'In Transit': 2,
  Delivered: 3,
  Cancelled: 4,
};

const formatCreatedDate = (createdAt: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(createdAt));

const statusClassName = (status: Shipment['status']) =>
  `status-${status.toLowerCase().replace(/\s+/g, '-')}`;

const RecentShipments: React.FC<RecentShipmentsProps> = ({
  shipments,
  loadingDelayMs = 500,
}) => {
  const isControlled = shipments !== undefined;
  const [isLoading, setIsLoading] = useState(isControlled ? loadingDelayMs > 0 : true);
  const [loadedShipments, setLoadedShipments] = useState<Shipment[]>(shipments ?? []);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [totalItems, setTotalItems] = useState<number>(shipments?.length ?? 0);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    if (isControlled) {
      const timer = window.setTimeout(() => {
        setLoadedShipments(shipments ?? []);
        setTotalItems(shipments?.length ?? 0);
        setPageSize(PAGE_SIZE);
        setIsLoading(false);
      }, loadingDelayMs);

      return () => window.clearTimeout(timer);
    }

    let isMounted = true;

    shipmentApi
      .getAll({ page: currentPage, limit: PAGE_SIZE })
      .then(({ shipments: results, meta }) => {
        if (!isMounted) {
          return;
        }

        setLoadedShipments(results);
        setPageSize(meta.limit);
        setTotalItems(meta.total);
        setCurrentPage(meta.page);
        setIsLoading(false);
      })
      .catch(error => {
        if (!isMounted) {
          return;
        }

        console.error('Unable to fetch recent shipments:', error);
        setLoadedShipments([]);
        setTotalItems(0);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isControlled, shipments, loadingDelayMs, currentPage]);

  const sortedShipments = useMemo(() => {
    const sorted = [...loadedShipments].sort((a, b) => {
      if (sortKey === 'createdAt') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return statusRank[a.status] - statusRank[b.status];
    });

    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [loadedShipments, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const currentRows = useMemo(() => {
    if (isControlled) {
      const start = (activePage - 1) * PAGE_SIZE;
      return sortedShipments.slice(start, start + PAGE_SIZE);
    }

    return sortedShipments;
  }, [activePage, sortedShipments, isControlled]);

  const handleSort = (nextKey: SortKey) => {
    if (sortKey === nextKey) {
      setCurrentPage(1);
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setCurrentPage(1);
    setSortKey(nextKey);
    setSortDirection('asc');
  };

  if (isLoading) {
    return (
      <div className="recent-shipments-skeleton" aria-label="Recent shipments loading">
        {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
          <div className="recent-shipments-skeleton-row" key={idx}>
            <span className="skeleton-cell" />
            <span className="skeleton-cell" />
            <span className="skeleton-cell" />
            <span className="skeleton-cell" />
            <span className="skeleton-cell" />
            <span className="skeleton-cell" />
          </div>
        ))}
      </div>
    );
  }

  if (sortedShipments.length === 0) {
    return (
      <div className="recent-shipments-empty">
        <h3>No shipments found</h3>
        <p>Start by creating your first shipment to track your delivery pipeline.</p>
        <button type="button" className="create-shipment-button">
          Create your first shipment
        </button>
      </div>
    );
  }

  return (
    <>
      <table className="shipments-table recent-shipments-table">
        <thead>
          <tr>
            <th>Shipment ID</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>
              <button
                type="button"
                className="sortable-header"
                onClick={() => handleSort('status')}
                aria-label={`Sort by status (${sortDirection})`}
              >
                Status
                <ChevronsUpDown size={14} />
              </button>
            </th>
            <th>
              <button
                type="button"
                className="sortable-header"
                onClick={() => handleSort('createdAt')}
                aria-label={`Sort by created date (${sortDirection})`}
              >
                Created Date
                <ChevronsUpDown size={14} />
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map(shipment => (
            <tr key={shipment.id}>
              <td className="shipment-id-cell">{shipment.id}</td>
              <td>{shipment.origin}</td>
              <td>{shipment.destination}</td>
              <td>
                <span className={`status-badge ${statusClassName(shipment.status)}`}>
                  {shipment.status}
                </span>
              </td>
              <td>{formatCreatedDate(shipment.createdAt)}</td>
              <td>
                <button type="button" className="verify-button">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="table-pagination" aria-label="Recent shipments pagination">
        <button
          type="button"
          className="pagination-nav"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={activePage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        <div className="pagination-pages">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;

            return (
              <button
                type="button"
                key={page}
                className={`pagination-page ${page === activePage ? 'is-active' : ''}`}
                onClick={() => setCurrentPage(page)}
                aria-label={`Page ${page}`}
                aria-current={page === activePage ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="pagination-nav"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={activePage === totalPages}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </>
  );
};

export default RecentShipments;

