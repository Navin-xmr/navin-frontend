import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { shipmentApi, type Shipment } from '../../api/shipmentApi';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import { safeFormatDate } from '../../utils/safeFormat';
import './Shipments.css';

const PAGE_SIZE = 5;

const Shipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    shipmentApi
      .getAll({ limit: PAGE_SIZE, page: currentPage })
      .then(response => {
        if (!isMounted) {
          return;
        }

        setShipments(response.data);
        setMeta(response.meta);
      })
      .catch(err => {
        if (!isMounted) {
          return;
        }

        setError(err.message || 'Unable to load shipments.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const isEmpty = !isLoading && !error && shipments.length === 0;

  const pageButtons = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;

        return (
          <button
            type="button"
            key={page}
            className={`pagination-page ${page === currentPage ? 'is-active' : ''}`}
            onClick={() => setCurrentPage(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        );
      }),
    [currentPage, totalPages]
  );

  return (
    <div className="shipments-page">
      <h1>Shipments</h1>

      {error ? (
        <div className="shipments-error">{error}</div>
      ) : isLoading ? (
        <div className="shipments-loading">Loading shipments...</div>
      ) : isEmpty ? (
        <div className="shipments-empty">
          <h3>No shipments available</h3>
          <p>There are no shipments to show for the selected page.</p>
        </div>
      ) : (
        <>
          <div className="shipments-summary">
            Page {meta.page} of {totalPages} · Showing {shipments.length} of {meta.total} shipments
          </div>

          <table className="shipments-table">
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
            <tbody>
              {shipments.map(shipment => (
                <tr key={shipment.id}>
                  <td>{shipment.id}</td>
                  <td>{shipment.origin}</td>
                  <td>{shipment.destination}</td>
                  <td>
                    <StatusBadge status={shipment.status} />
                  </td>
                  <td>{safeFormatDate(shipment.createdAt)}</td>
                  <td>
                    <button type="button" className="verify-button">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-pagination" aria-label="Shipments pagination">
            <button
              type="button"
              className="pagination-nav"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            <div className="pagination-pages">{pageButtons}</div>

            <button
              type="button"
              className="pagination-nav"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Shipments;


