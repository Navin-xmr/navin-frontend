import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Circle, Package, Truck, MapPin, Flag } from 'lucide-react';

interface PublicMilestone {
  id: string;
  label: string;
  status: string;
  timestamp: string;
  location?: string;
  isCompleted: boolean;
  isCurrent?: boolean;
}

interface PublicShipment {
  trackingNumber: string;
  status: string;
  originCity: string;
  destinationCity: string;
  expectedDelivery: string;
  milestones: PublicMilestone[];
}

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  IN_TRANSIT: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Pending',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const MILESTONE_ICONS: Record<string, React.ReactNode> = {
  Created: <Package className="w-5 h-5" />,
  'In Transit': <Truck className="w-5 h-5" />,
  'At Checkpoint': <MapPin className="w-5 h-5" />,
  Delivered: <Flag className="w-5 h-5" />,
};

export interface PublicTrackingPageProps {}

const PublicTrackingPage: React.FC<PublicTrackingPageProps> = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [shipment, setShipment] = useState<PublicShipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!trackingNumber) return;
    let isActive = true;

    const fetchShipment = async () => {
      try {
        const res = await axios.get<{ data: PublicShipment }>(`/api/public/shipments/${trackingNumber}`);
        if (isActive) setShipment(res.data.data);
      } catch (err: any) {
        if (isActive && err.response?.status === 404) setNotFound(true);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    // Defer setLoading to avoid synchronous setState warning
    Promise.resolve().then(() => {
      if (isActive) setLoading(true);
    }).then(() => fetchShipment());

    return () => {
      isActive = false;
    };
  }, [trackingNumber]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      {/* Navbar */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
          <Package className="w-4 h-4 text-cyan-400" />
        </div>
        <span className="font-bold text-lg tracking-tight">Navin</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-12">
        {loading && (
          <div className="text-slate-400 text-sm animate-pulse mt-20">Loading shipment…</div>
        )}

        {!loading && notFound && (
          <div className="max-w-md w-full text-center mt-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Package className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Shipment Not Found</h1>
            <p className="text-slate-400 mb-6">
              No shipment matches tracking number <span className="text-white font-mono">{trackingNumber}</span>.
              Please check the number and try again.
            </p>
            <Link
              to="/signup"
              className="inline-block px-5 py-2.5 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors text-sm"
            >
              Create a Navin Account
            </Link>
          </div>
        )}

        {!loading && shipment && (
          <div className="max-w-2xl w-full space-y-8">
            {/* Status Banner */}
            <div className="rounded-2xl border border-white/5 bg-white/2 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Tracking Number</p>
                  <h1 className="text-2xl font-bold font-mono">{shipment.trackingNumber}</h1>
                </div>
                <span className={`self-start sm:self-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${STATUS_COLORS[shipment.status] ?? 'bg-white/5 text-slate-300'}`}>
                  {STATUS_LABELS[shipment.status] ?? shipment.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">From</p>
                  <p className="font-medium">{shipment.originCity}</p>
                </div>
                <div className="flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">To</p>
                  <p className="font-medium">{shipment.destinationCity}</p>
                </div>
              </div>

              {shipment.expectedDelivery && (
                <div className="mt-4 pt-4 border-t border-white/5 text-sm">
                  <span className="text-slate-500">Expected Delivery: </span>
                  <span className="font-medium">
                    {new Date(shipment.expectedDelivery).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Milestone Timeline (read-only) */}
            <div className="rounded-2xl border border-white/5 bg-white/2 p-6">
              <h2 className="text-lg font-semibold mb-6">Tracking Timeline</h2>
              <div className="flex flex-col space-y-0 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {shipment.milestones.map((m) => (
                  <div key={m.id} className="relative flex items-start gap-5 pb-8 last:pb-0">
                    <div className="relative z-10 shrink-0">
                      {m.isCompleted ? (
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : m.isCurrent ? (
                        <div className="w-10 h-10 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 animate-pulse">
                          {MILESTONE_ICONS[m.status] ?? <Circle className="w-5 h-5" />}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-600">
                          <Circle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className={`flex-1 p-4 rounded-xl border text-sm transition-all ${
                      m.isCurrent
                        ? 'bg-cyan-400/5 border-cyan-400/20'
                        : m.isCompleted
                        ? 'bg-white/3 border-white/8'
                        : 'bg-transparent border-white/5 opacity-50'
                    }`}>
                      <div className="flex justify-between items-start gap-2">
                        <span className={`font-semibold ${m.isCurrent ? 'text-cyan-400' : m.isCompleted ? 'text-white' : 'text-slate-500'}`}>
                          {m.label}
                        </span>
                        <span className="text-slate-500 text-xs shrink-0">{m.timestamp}</span>
                      </div>
                      {m.location && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">{m.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-6 text-center">
              <p className="text-sm text-slate-300 mb-1 font-medium">Powered by Navin Logistics</p>
              <p className="text-xs text-slate-500 mb-4">
                Blockchain-verified shipment tracking. Create an account to access full analytics, IoT data, and automated settlements.
              </p>
              <Link
                to="/signup"
                className="inline-block px-6 py-2.5 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors text-sm"
              >
                Create a Free Account
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicTrackingPage;
