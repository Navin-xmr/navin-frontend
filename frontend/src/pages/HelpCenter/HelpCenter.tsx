import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetTourFlag } from '@components/onboarding/OnboardingTour';
import { HelpCircle, RotateCcw } from 'lucide-react';
import Breadcrumb from '@components/common/Breadcrumb';
import { resetChecklist } from '@components/onboarding/OnboardingChecklist';
import EmptyState from '@components/ui/EmptyState/EmptyState';
import { useToast } from '@context/ToastContext';
import {
  HelpCircle,
  RotateCcw,
  Search,
  Package,
  MapPin,
  Users,
  Wallet,
  BarChart3,
  FileText,
  ChevronRight,
  ListChecks,
} from 'lucide-react';

// === Types

interface HelpTask {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  keywords: string[];
}

// === Data

const COMMON_TASKS: HelpTask[] = [
  {
    id: 'create-shipment',
    title: 'Create a shipment',
    description: 'Register a new shipment and record it on the blockchain.',
    path: '/dashboard/shipments/create',
    icon: <Package size={18} />,
    keywords: ['new', 'shipment', 'create', 'template'],
  },
  {
    id: 'track-shipment',
    title: 'Track a shipment',
    description: 'Follow live milestones, IoT sensor data, and delivery status.',
    path: '/dashboard/shipments',
    icon: <MapPin size={18} />,
    keywords: ['track', 'status', 'milestone', 'delivery'],
  },
  {
    id: 'invite-team',
    title: 'Invite a teammate',
    description: 'Add operators to your workspace and manage their roles.',
    path: '/dashboard/team',
    icon: <Users size={18} />,
    keywords: ['team', 'invite', 'user', 'role', 'permission'],
  },
  {
    id: 'connect-wallet',
    title: 'Connect a wallet',
    description: 'Link a Stellar wallet to sign settlement transactions.',
    path: '/dashboard/settings',
    icon: <Wallet size={18} />,
    keywords: ['wallet', 'stellar', 'freighter', 'settlement', 'sign'],
  },
  {
    id: 'view-analytics',
    title: 'Review analytics',
    description: 'Check revenue, cost per route, and delivery performance.',
    path: '/dashboard/analytics',
    icon: <BarChart3 size={18} />,
    keywords: ['analytics', 'revenue', 'report', 'performance', 'cost'],
  },
  {
    id: 'payments',
    title: 'Find an invoice or payment',
    description: 'Browse settlement history and download payment records.',
    path: '/dashboard/payments',
    icon: <FileText size={18} />,
    keywords: ['invoice', 'payment', 'billing', 'settlement', 'receipt'],
  },
];

// === Component

const HelpCenter: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [query, setQuery] = useState<string>('');

  const filteredTasks = useMemo<HelpTask[]>(() => {
    const term = query.trim().toLowerCase();
    if (!term) return COMMON_TASKS;
    return COMMON_TASKS.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term) ||
        task.keywords.some((keyword) => keyword.includes(term)),
    );
  }, [query]);

  const handleRestartTour = () => {
    resetTourFlag();
    // Reload the page so the tour can start fresh
    window.location.reload();
  };

  const handleResetChecklist = () => {
    resetChecklist();
    addToast('Setup checklist restored on your dashboard.', 'success');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }]} current="Help Center" />
      <div className="flex items-center gap-3 mb-8">
    <div className="w-full max-w-3xl mx-auto px-6 py-8 max-md:px-4">
      <div className="flex items-center gap-3 mb-2">
        <HelpCircle size={28} className="text-[#62ffff]" />
        <h1 className="text-2xl font-bold text-white m-0">Help Center</h1>
      </div>
      <p className="text-sm text-[#94a3b8] mb-8">
        Jump straight to the task you need, or restart the guided introduction.
      </p>

      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search common tasks…"
          aria-label="Search common tasks"
          className="w-full rounded-lg border border-[#1e293b] bg-[#0b0e14] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-[#64748b] focus:border-[#62ffff] focus:outline-none"
        />
      </div>

      <section aria-labelledby="common-tasks-heading" className="mb-8">
        <h2
          id="common-tasks-heading"
          className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#64748b] mb-3"
        >
          Common tasks
        </h2>

        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={<Search size={24} />}
            title="No matching tasks"
            description="Try a different keyword, or contact support below."
            action={{ label: 'Clear search', onClick: () => setQuery('') }}
          />
        ) : (
          <ul className="list-none m-0 p-0 grid grid-cols-2 gap-3 max-md:grid-cols-1">
            {filteredTasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => navigate(task.path)}
                  className="w-full h-full flex items-start gap-3 text-left rounded-xl border border-[#1e293b] bg-[#14171e] p-4 cursor-pointer transition-colors hover:border-[#62ffff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#62ffff]"
                >
                  <span className="mt-0.5 text-[#62ffff]">{task.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-white">{task.title}</span>
                    <span className="block text-xs text-[#94a3b8] mt-1 leading-relaxed">
                      {task.description}
                    </span>
                  </span>
                  <ChevronRight size={16} className="mt-0.5 text-[#64748b] shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-[#14171e] border border-[#1e293b] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Getting started again</h2>
        <p className="text-sm text-[#94a3b8] mb-4 leading-relaxed">
          Replay the guided introduction to Navin, or bring back the setup checklist on your
          dashboard.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRestartTour}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all border-none
              bg-gradient-to-br from-[#13baba] to-[#0d9488] text-white
              hover:from-[#0d9488] hover:to-[#0b7d7a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#62ffff]"
          >
            <RotateCcw size={16} />
            Restart Tour
          </button>
          <button
            onClick={handleResetChecklist}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors
              border border-[#1e293b] bg-transparent text-[#cbd5e1]
              hover:border-[#62ffff] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#62ffff]"
          >
            <ListChecks size={16} />
            Restore Setup Checklist
          </button>
        </div>
      </section>

      <section className="bg-[#14171e] border border-[#1e293b] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Contact Support</h2>
        <p className="text-sm text-[#94a3b8] leading-relaxed">
          Need further assistance? Reach out to our team at{' '}
          <a href="mailto:support@navin.io" className="text-[#62ffff] underline">
            support@navin.io
          </a>
        </p>
      </section>
    </div>
  );
};

export default HelpCenter;
