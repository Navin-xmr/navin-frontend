import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentApi, type Shipment } from '../../api/shipmentApi';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import { safeFormatDate } from '../../utils/safeFormat';
import { useVirtualShipments } from './hooks/useVirtualShipments';
import './Shipments.css';

const PAGE_SIZE = 50;
const SCROLL_KEY = 'shipments-scroll-index';

const Shipments: React.FC = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const hasMore = shipments.length < total;

  const { parentRef, virtualizer, handleScroll, scrollToIndex } = useVirtualShipments({
    shipments,
    onLoadMore: () => setCurrentPage((p) => p + 1),
    hasMore,
  });

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    shipmentApi
      .getAll({ limit: PAGE_SIZE, page: currentPage })
      .then((response) => {
        setShipments((prev) =>
          currentPage === 1 ? response.data : [...prev, ...response.data],
        );
        setTotal(response.meta.total);
      })
      .catch((err: Error) => {
        setError(err.message || 'Unable to load shipments.');
      })
      .finally(() => {
        setIsLoading(false);
        loadingRef.current = false;
      });
  }, [currentPage]);

  // Restore scroll position on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      const idx = parseInt(saved, 10);
      if (!isNaN(idx) && idx > 0) {
        requestAnimationFrame(() => scrollToIndex(idx));
      }
    }
    return () => {
      sessionStorage.removeItem(SCROLL_KEY);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRowClick = (shipmentId: string, index: number) => {
    sessionStorage.setItem(SCROLL_KEY, String(index));
    navigate(`/dashboard/shipments/${shipmentId}`);
  };

  const isEmpty = !isLoading && !error && shipments.length === 0;
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div className="shipments-page">
      <h1>Shipments</h1>

      {error ? (
        <div className="shipments-error">{error}</div>
      ) : isEmpty ? (
        <div className="shipments-empty">
          <h3>No shipments available</h3>
          <p>There are no shipments to show.</p>
        </div>
      ) : (
        <>
          <div className="shipments-summary">
            Showing {shipments.length} of {total} shipments
          </div>

          {/* Sticky table header */}
          <table className="shipments-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
          </table>

          {/* Virtualised scrollable body */}
          <div
            ref={parentRef}
            onScroll={handleScroll}
            style={{ height: '500px', overflowY: 'auto', position: 'relative' }}
          >
            <table
              className="shipments-table"
              style={{ tableLayout: 'fixed', width: '100%' }}
              aria-label="Shipments list"
            >
              <tbody style={{ display: 'block', height: `${totalSize}px`, position: 'relative' }}>
                {virtualItems.map((virtualRow) => {
                  const shipment = shipments[virtualRow.index];
                  if (!shipment) return null;
                  return (
                    <tr
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                        display: 'table',
                        tableLayout: 'fixed',
                      }}
                    >
                      <td>{shipment.id}</td>
                      <td>{shipment.origin}</td>
                      <td>{shipment.destination}</td>
                      <td>
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td>{safeFormatDate(shipment.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="verify-button"
                          onClick={() => handleRowClick(shipment.id, virtualRow.index)}
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
            <div className="shipments-loading" aria-live="polite">
              Loading more shipments…
            </div>
          )}

          {!hasMore && shipments.length > 0 && (
            <div className="shipments-summary" style={{ marginTop: '0.5rem' }}>
              All {total} shipments loaded
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Shipments;
