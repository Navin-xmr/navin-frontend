import React from 'react';
import {
  Skeleton,
  ShipmentCardSkeleton,
  TableRowSkeleton,
  DashboardWidgetSkeleton,
  ProfileSkeleton,
  ShipmentsTableSkeleton,
  CardSkeleton,
  TableSkeleton,
} from '../../../components/ui/Skeleton';

const SkeletonDemo: React.FC = () => {
  return (
    <div className="p-8 bg-background min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-8">Skeleton Loader Demo</h1>
      
      <div className="grid gap-12 max-w-4xl">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">1. Base Skeleton — Pulse vs Shimmer</h2>
          <div className="mb-4">
            <p className="text-sm text-text-secondary mb-3">Pulse (default)</p>
            <div className="flex gap-4 items-end">
              <Skeleton width={100} height={100} rounded="full" variant="pulse" />
              <Skeleton width={200} height={40} rounded="md" variant="pulse" />
              <Skeleton width={150} height={20} rounded="sm" variant="pulse" />
            </div>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-3">Shimmer</p>
            <div className="flex gap-4 items-end">
              <Skeleton width={100} height={100} rounded="full" variant="shimmer" />
              <Skeleton width={200} height={40} rounded="md" variant="shimmer" />
              <Skeleton width={150} height={20} rounded="sm" variant="shimmer" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">2. Profile Skeleton</h2>
          <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl w-64">
            <ProfileSkeleton count={1} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">3. Shipment Card Skeleton (Kanban)</h2>
          <div className="w-80">
            <ShipmentCardSkeleton count={2} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">4. Table Row Skeleton</h2>
          <div className="overflow-x-auto bg-[#14171e] border border-[#1e293b] rounded-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="p-4 font-semibold text-sm">ID</th>
                  <th className="p-4 font-semibold text-sm">Origin</th>
                  <th className="p-4 font-semibold text-sm">Destination</th>
                  <th className="p-4 font-semibold text-sm">Status</th>
                  <th className="p-4 font-semibold text-sm">Priority</th>
                  <th className="p-4 font-semibold text-sm">Date</th>
                  <th className="p-4 font-semibold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                <TableRowSkeleton count={3} />
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">5. Shipments Table Skeleton</h2>
          <p className="text-sm text-slate-400 mb-4">
            Full skeleton matching the Shipments page layout — used during initial page load to prevent layout jumps.
            Shows the real column headers with 8 animated placeholder rows.
          </p>
          <div className="overflow-x-auto bg-[#14171e] border border-[#1e293b] rounded-lg p-2">
            <ShipmentsTableSkeleton count={5} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">6. Dashboard Widget Skeleton</h2>
          <div className="w-full max-w-2xl">
            <DashboardWidgetSkeleton count={1} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">6. Card Skeleton — Pulse</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CardSkeleton count={3} variant="pulse" />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">7. Card Skeleton — Shimmer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CardSkeleton count={3} variant="shimmer" />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">8. Table Skeleton — Pulse (5 rows × 4 cols)</h2>
          <TableSkeleton rows={5} columns={4} variant="pulse" />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">9. Table Skeleton — Shimmer (3 rows × 6 cols)</h2>
          <TableSkeleton rows={3} columns={6} variant="shimmer" />
        </section>
      </div>
    </div>
  );
};

export default SkeletonDemo;
