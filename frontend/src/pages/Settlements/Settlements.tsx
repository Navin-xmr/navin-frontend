import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSettlements, fetchSettlementSummary } from '../../api/settlements';
import { SettlementCard, SummaryCard } from '../../components';
import { formatCurrency } from '../../utils';

interface SummaryStats {
  totalRevenue: number;
  disputeCount: number;
  settlementCount: number;
}

const Settlements: React.FC = () => {
  const { startDate, endDate } = useParams<{ startDate: string; endDate: string }>();
  const [settlements, setSettlements] = useState([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch summary stats from dedicated endpoint
        const summaryResponse = await fetchSettlementSummary(startDate, endDate);
        setSummaryStats(summaryResponse.data);

        // Fetch paginated settlements
        const response = await fetchSettlements(startDate, endDate, page);
        setSettlements(response.data.settlements);
      } catch (error) {
        console.error('Failed to load settlements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [startDate, endDate, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="settlements-container">
      <h1>Settlements Summary</h1>

      <div className="summary-cards">
        {summaryStats && (
          <>
            <SummaryCard
              title="Total Revenue"
              value={formatCurrency(summaryStats.totalRevenue)}
              icon="currency"
            />
            <SummaryCard
              title="Dispute Count"
              value={summaryStats.disputeCount}
              icon="alert"
            />
            <SummaryCard
              title="Total Settlements"
              value={summaryStats.settlementCount}
              icon="document"
            />
          </>
        )}
      </div>

      <div className="settlements-table">
        {settlements.map((settlement) => (
          <SettlementCard key={settlement.id} {...settlement} />
        ))}
      </div>

      <div className="pagination">
        {/* Pagination controls */}
      </div>
    </div>
  );
};

export default Settlements;