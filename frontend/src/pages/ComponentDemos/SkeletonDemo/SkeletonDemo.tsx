import React from 'react';
import {
  Skeleton,
  ShipmentCardSkeleton,
  TableRowSkeleton,
  DashboardWidgetSkeleton,
  ProfileSkeleton,
} from '../../../components/ui/Skeleton';

const SkeletonDemo: React.FC = () => {
  return (
    <div className="p-8 bg-background min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-8">Skeleton Loader Demo</h1>
      
      <div className="grid gap-12 max-w-4xl">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">1. Base Skeleton Primitive</h2>
          <div className="flex gap-4 items-end">
            <Skeleton width={100} height={100} rounded="full" />
            <Skeleton width={200} height={40} rounded="md" />
            <Skeleton width={150} height={20} rounded="sm" />
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
          <h2 className="text-xl font-semibold mb-4 text-[#62ffff]">5. Dashboard Widget Skeleton</h2>
          <div className="w-full max-w-2xl">
            <DashboardWidgetSkeleton count={1} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default SkeletonDemo;
