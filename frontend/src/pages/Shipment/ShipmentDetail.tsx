import React from 'react';
import MilestoneTimeline from './sections/MilestoneTimeline/MilestoneTimeline';
import { Milestone } from './sections/MilestoneTimeline/types';

const ShipmentDetail: React.FC = () => {
  const mockMilestones: Milestone[] = [
    {
      id: '1',
      status: 'Created',
      label: 'Shipment Created',
      timestamp: 'Oct 20, 2026, 09:00 AM',
      location: 'Warehouse A, San Francisco',
      isCompleted: true,
    },
    {
      id: '2',
      status: 'In Transit',
      label: 'Picked Up by Carrier',
      timestamp: 'Oct 21, 2026, 02:30 PM',
      location: 'San Francisco Distribution Center',
      isCompleted: true,
    },
    {
      id: '3',
      status: 'At Checkpoint',
      label: 'Customs Clearance',
      timestamp: 'Oct 22, 2026, 11:15 AM',
      location: 'Port of Los Angeles',
      isCompleted: false,
      isCurrent: true,
    },
    {
      id: '4',
      status: 'Delivered',
      label: 'Delivered to Destination',
      timestamp: 'Estimated: Oct 24, 2026',
      location: 'Retail Store, San Diego',
      isCompleted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
              In Transit
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Shipment <span className="text-primary">#NVN-2026-X81</span>
            </h1>
          </div>
          <p className="text-text-secondary">
            Blockchain-verified tracking for secure global logistics.
          </p>
        </header>

        <main>
          <section className="bg-background-card border border-border rounded-3xl p-6 md:p-10 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Package className="w-32 h-32" />
            </div>
            
            <h2 className="text-2xl font-display font-semibold mb-8 border-b border-border pb-4">
              Tracking <span className="text-primary">Timeline</span>
            </h2>
            
            <MilestoneTimeline milestones={mockMilestones} />
          </section>
        </main>

        <footer className="mt-12 text-center text-text-secondary text-sm">
          <p>© 2026 Navin Logistics Platform. All milestones are recorded on the Stellar blockchain.</p>
        </footer>
      </div>
    </div>
  );
};

// Simple Package icon for the background decoration
const Package = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>
);

export default ShipmentDetail;
