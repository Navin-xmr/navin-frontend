import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowRightCircle, PackageCheck, Truck, AlertCircle } from 'lucide-react';
import MilestoneTimeline from '../Shipment/sections/MilestoneTimeline/MilestoneTimeline';
import type { Milestone } from '../Shipment/sections/MilestoneTimeline/types';

interface PublicShipmentResponse {
  data?: {
    trackingNumber?: string;
    status?: string;
    origin?: string;
    destination?: string;
    expectedDeliveryDate?: string;
    milestones?: Array<{
      id?: string;
      label?: string;
      timestamp?: string;
      location?: string;
      status?: string;
      isCompleted?: boolean;
      isCurrent?: boolean;
    }>;
  };
}

const PublicTrackingPage: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [shipment, setShipment] = useState<PublicShipmentResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShipment = async () => {
      if (!trackingNumber) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get<PublicShipmentResponse>(`/api/public/shipments/${trackingNumber}`);
        setShipment(response.data?.data ?? null);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setShipment(null);
        } else {
          setShipment(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchShipment();
  }, [trackingNumber]);

  const milestones = useMemo<Milestone[]>(() => {
    if (!shipment?.milestones?.length) {
      return [];
    }

    return shipment.milestones.map((milestone, index) => ({
      id: milestone.id ?? `${milestone.label ?? 'milestone'}-${index}`,
      status: (milestone.status as Milestone['status']) ?? 'Created',
      label: milestone.label ?? 'Milestone',
      timestamp: milestone.timestamp ?? 'Pending',
      location: milestone.location,
      isCompleted: milestone.isCompleted ?? index < shipment.milestones!.length - 1,
      isCurrent: milestone.isCurrent ?? false,
    }));
  }, [shipment]);

  const statusBadgeClass = useMemo(() => {
    const normalized = (shipment?.status ?? '').toUpperCase();
    if (normalized.includes('DELIVER')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    if (normalized.includes('TRANSIT') || normalized.includes('IN')) return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    if (normalized.includes('CANCEL')) return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  }, [shipment]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#153344_0%,_#09131c_45%,_#04070b_100%)] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-6 py-10 lg:px-10">
        <div>
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                <PackageCheck size={24} />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-[0.3em] text-white">NAVIN</p>
                <p className="text-sm text-slate-400">Public shipment tracking</p>
              </div>
            </div>
            <Link to="/signup" className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20">
              Create Account
            </Link>
          </div>

          {isLoading ? (
            <div className="rounded-3xl border border-slate-700/70 bg-slate-900/70 p-8 text-center text-slate-300">
              Loading tracking information…
            </div>
          ) : !shipment ? (
            <div className="rounded-3xl border border-rose-500/30 bg-slate-900/70 p-10 text-center shadow-2xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-300">
                <AlertCircle size={28} />
              </div>
              <h1 className="mb-3 text-3xl font-semibold text-white">Shipment not found</h1>
              <p className="mx-auto max-w-xl text-slate-400">
                We could not find a public shipment with this tracking number. Please check the link or contact the carrier.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <section className="rounded-3xl border border-slate-700/70 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Tracking number</p>
                    <h1 className="mt-2 text-3xl font-semibold text-white">{shipment.trackingNumber ?? trackingNumber}</h1>
                  </div>
                  <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${statusBadgeClass}`}>
                    {shipment.status ?? 'Unknown'}
                  </span>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                    <div className="flex items-center gap-3 text-cyan-300">
                      <Truck size={18} />
                      <p className="text-sm font-semibold uppercase tracking-[0.25em]">Shipment overview</p>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Origin</p>
                        <p className="mt-1 text-sm text-slate-200">{shipment.origin ?? 'Unavailable'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Destination</p>
                        <p className="mt-1 text-sm text-slate-200">{shipment.destination ?? 'Unavailable'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected delivery</p>
                        <p className="mt-1 text-sm text-slate-200">{shipment.expectedDeliveryDate ?? 'Pending'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Status banner</p>
                    <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-200">
                      Your shipment is currently <span className="font-semibold">{shipment.status ?? 'in progress'}</span>.
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-700/70 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">Milestone timeline</h2>
                  <span className="text-sm text-slate-400">Read-only view</span>
                </div>
                {milestones.length ? (
                  <MilestoneTimeline milestones={milestones} />
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-sm text-slate-400">
                    No milestone data is available for this shipment yet.
                  </p>
                )}
              </section>
            </div>
          )}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-700/70 bg-slate-900/70 px-6 py-5 text-center text-sm text-slate-400">
          <p className="mb-2">Need full shipment management and collaboration tools?</p>
          <Link to="/signup" className="inline-flex items-center gap-2 font-semibold text-cyan-300 transition hover:text-cyan-200">
            Create a Navin account <ArrowRightCircle size={16} />
          </Link>
        </div>
      </div>
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
    setLoading(true);
    axios
      .get<{ data: PublicShipment }>(`/api/public/shipments/${trackingNumber}`)
      .then((res) => setShipment(res.data.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
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
