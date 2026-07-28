import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetTourFlag } from '@components/onboarding/OnboardingTour';
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
  ChevronDown,
  ListChecks,
  Link2,
  Landmark,
  PlayCircle,
  Keyboard,
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

interface FaqEntry {
  question: string;
  answer: string;
}

interface QuickLink {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface ShortcutRow {
  keys: string;
  action: string;
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

const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: 'How do I create a new shipment?',
    answer:
      'Go to Shipments and select "New Shipment". Fill in the pickup and delivery details, attach any documents or photos, and submit — the shipment is registered on-chain and appears in your Shipments list with a Pending status.',
  },
  {
    question: 'How does escrow and automated settlement work?',
    answer:
      'When a shipment is confirmed, payment funds are held in escrow on the Stellar blockchain. Once the delivery milestones are verified, the smart contract automatically releases the funds to the logistics provider — no manual invoicing or approval step required.',
  },
  {
    question: 'How do I connect my Stellar wallet?',
    answer:
      'Open Settings and choose "Connect Wallet". Select your wallet provider (Freighter, Lobstr, or Solar Wallet) and approve the connection request. Once connected, your wallet address is used to sign and verify settlement transactions.',
  },
  {
    question: 'What does each shipment status mean?',
    answer:
      'Pending means the shipment is registered but not yet picked up. In Transit means it is actively moving between milestones. Delivered means all milestones are complete. Exception flags an anomaly (delay, damage, or missed checkpoint) that needs attention.',
  },
  {
    question: 'How do I invite a team member?',
    answer:
      'Go to Team, select "Invite", and enter the teammate\'s email along with their role. They will receive an invite link to set up their account with the permissions you assigned.',
  },
];

const SHORTCUT_ROWS: ShortcutRow[] = [
  { keys: 'Alt + D', action: 'Go to Dashboard' },
  { keys: 'Alt + Shift + S', action: 'Go to Shipments' },
  { keys: 'Alt + E', action: 'Go to Settlements' },
  { keys: 'Alt + P', action: 'Go to Payments' },
  { keys: 'Alt + L', action: 'Go to Analytics' },
  { keys: 'Alt + Shift + N', action: 'Go to Notifications' },
  { keys: 'Alt + Shift + Q', action: 'Go to Settings' },
  { keys: '? / Shift + /', action: 'Toggle this help dialog' },
];

// === Component

const HelpCenter: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [query, setQuery] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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

  const quickLinks: QuickLink[] = [
    {
      id: 'blockchain-ledger',
      label: 'Blockchain Ledger',
      description: 'View on-chain shipment and settlement records.',
      icon: <Link2 size={18} />,
      onClick: () => navigate('/dashboard/blockchain-ledger'),
    },
    {
      id: 'settlements',
      label: 'Settlements',
      description: 'Track escrow and payment settlement status.',
      icon: <Landmark size={18} />,
      onClick: () => navigate('/dashboard/settlements'),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'Review revenue, cost, and performance trends.',
      icon: <BarChart3 size={18} />,
      onClick: () => navigate('/dashboard/analytics'),
    },
    {
      id: 'restart-tour',
      label: 'Restart onboarding tour',
      description: 'Replay the guided introduction to Navin.',
      icon: <RotateCcw size={18} />,
      onClick: handleRestartTour,
    },
  ];

  return (
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

      <section aria-labelledby="quick-links-heading" className="mb-6">
        <h2
          id="quick-links-heading"
          className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#64748b] mb-3"
        >
          Quick links
        </h2>
        <ul className="list-none m-0 p-0 grid grid-cols-3 gap-3 max-md:grid-cols-1">
          {quickLinks.map((link) => (
            <li key={link.id}>
              <button
                type="button"
                onClick={link.onClick}
                className="w-full h-full flex flex-col items-start gap-2 text-left rounded-xl border border-[#1e293b] bg-[#14171e] p-4 cursor-pointer transition-colors hover:border-[#62ffff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#62ffff]"
              >
                <span className="text-[#62ffff]">{link.icon}</span>
                <span className="text-sm font-semibold text-white">{link.label}</span>
                <span className="text-xs text-[#94a3b8] leading-relaxed">{link.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq-heading" className="mb-6">
        <h2
          id="faq-heading"
          className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#64748b] mb-3"
        >
          Frequently asked questions
        </h2>
        <div className="flex flex-col gap-2">
          {FAQ_ENTRIES.map((entry, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={entry.question}
                className="rounded-xl border border-[#1e293b] bg-[#14171e] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#62ffff]"
                >
                  <span className="text-sm font-semibold text-white">{entry.question}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[#64748b] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm text-[#94a3b8] leading-relaxed">{entry.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="shortcuts-heading" className="bg-[#14171e] border border-[#1e293b] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Keyboard size={18} className="text-[#62ffff]" />
          <h2 id="shortcuts-heading" className="text-lg font-semibold text-white m-0">
            Keyboard shortcuts
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left font-semibold text-[#64748b] py-2 pr-4 whitespace-nowrap">
                  Shortcut key
                </th>
                <th className="text-left font-semibold text-[#64748b] py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {SHORTCUT_ROWS.map((row) => (
                <tr key={row.keys} className="border-b border-[#1e293b] last:border-b-0">
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <kbd className="text-xs font-mono bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded px-2 py-1 text-[#62ffff]">
                      {row.keys}
                    </kbd>
                  </td>
                  <td className="py-2.5 text-[#cbd5e1]">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="video-heading" className="mb-6">
        <h2
          id="video-heading"
          className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#64748b] mb-3"
        >
          Video guide
        </h2>
        <div
          data-src="https://www.youtube.com/watch?v=REPLACE_ME"
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#1e293b] bg-[#14171e] p-10 text-center"
        >
          <PlayCircle size={40} className="text-[#62ffff]" />
          <p className="text-sm font-semibold text-white m-0">Getting Started with Navin</p>
          <p className="text-xs text-[#94a3b8] m-0">Video walkthrough coming soon.</p>
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
