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
    </div>
  );
};

export default PublicTrackingPage;
