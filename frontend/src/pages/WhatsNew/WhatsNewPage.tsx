import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Shield,
  Truck,
  BarChart2,
  Bell,
  Settings,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  Star,
} from 'lucide-react';

export interface ReleaseNote {
  version: string;
  date: string;
  tag: 'major' | 'minor' | 'patch';
  title: string;
  summary: string;
  highlights?: string[];
  changes: ReleaseChange[];
}

export interface ReleaseChange {
  type: 'feature' | 'improvement' | 'fix' | 'security';
  description: string;
  issueNumber?: number;
}

const CHANGE_TYPE_STYLES: Record<
  ReleaseChange['type'],
  { label: string; className: string }
> = {
  feature: {
    label: 'New',
    className: 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border border-[rgba(59,130,246,0.25)]',
  },
  improvement: {
    label: 'Improved',
    className: 'bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(16,185,129,0.25)]',
  },
  fix: {
    label: 'Fixed',
    className: 'bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border border-[rgba(245,158,11,0.25)]',
  },
  security: {
    label: 'Security',
    className: 'bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.25)]',
  },
};

const TAG_STYLES: Record<ReleaseNote['tag'], string> = {
  major: 'bg-[rgba(98,255,255,0.12)] text-[#62ffff] border border-[rgba(98,255,255,0.25)]',
  minor: 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa] border border-[rgba(59,130,246,0.25)]',
  patch: 'bg-[rgba(100,116,139,0.12)] text-[#94a3b8] border border-[rgba(100,116,139,0.25)]',
};

const CHANGE_TYPE_ICONS: Record<ReleaseChange['type'], React.ReactNode> = {
  feature: <Star size={13} />,
  improvement: <Zap size={13} />,
  fix: <CheckCircle2 size={13} />,
  security: <Shield size={13} />,
};

// Curated release notes — these represent Navin's shipped improvements
const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '1.5.0',
    date: 'July 2026',
    tag: 'major',
    title: 'Dashboard Home Overhaul',
    summary:
      'A completely redesigned dashboard home with a live recent-activity panel, widget layout presets, and deep analytics integration.',
    highlights: [
      'Recent Activity panel with live updates every 60 seconds',
      'Customizable widget layout with save presets',
      'What\'s New release notes section — you\'re reading it!',
    ],
    changes: [
      {
        type: 'feature',
        description: 'Added Recent Activity panel to dashboard home showing grouped shipment events.',
        issueNumber: 525,
      },
      {
        type: 'feature',
        description: 'Added What\'s New / Release Notes section accessible from the sidebar.',
        issueNumber: 541,
      },
      {
        type: 'improvement',
        description: 'Dashboard layout presets (Operations, Finance, Overview) now persist across sessions.',
      },
      {
        type: 'improvement',
        description: 'Widget visibility toggles now sync with localStorage immediately.',
      },
    ],
  },
  {
    version: '1.4.0',
    date: 'June 2026',
    tag: 'major',
    title: 'Shipment Volume Trend Widget & Cost Analytics',
    summary:
      'New analytics widgets give logistics managers granular visibility into shipment trends and per-route cost breakdowns.',
    highlights: [
      'Interactive shipment volume trend chart with date-range filtering',
      'Cost-per-route widget with route drilldown modal',
      'Revenue target tracker with circular progress visualisation',
    ],
    changes: [
      {
        type: 'feature',
        description: 'Shipment Volume Trend Widget with weekly/monthly/quarterly toggles.',
      },
      {
        type: 'feature',
        description: 'Cost Per Route Widget with drilldown to individual shipments per route.',
      },
      {
        type: 'feature',
        description: 'Revenue Target Widget showing progress toward monthly settlement goals.',
      },
      {
        type: 'improvement',
        description: 'Charts now use skeleton loaders during data fetch for a smoother experience.',
      },
    ],
  },
  {
    version: '1.3.0',
    date: 'May 2026',
    tag: 'major',
    title: 'Onboarding Tour & Widget Refresh Indicators',
    summary:
      'First-time users now get a guided tour of the dashboard. All data widgets now show a last-refreshed timestamp and a manual refresh button.',
    highlights: [
      'Step-by-step onboarding tour for new company accounts',
      'Widget-level refresh indicators with age display',
      'Autosave banner for form drafts',
    ],
    changes: [
      {
        type: 'feature',
        description: 'Onboarding tour highlights key dashboard areas for new users.',
      },
      {
        type: 'feature',
        description: 'WidgetRefreshIndicator component shows stale-data warnings after configurable thresholds.',
      },
      {
        type: 'feature',
        description: 'AutosaveBanner component provides visual confirmation when form drafts are saved.',
      },
      {
        type: 'fix',
        description: 'Tour overlay z-index conflict with the sidebar on mobile resolved.',
      },
    ],
  },
  {
    version: '1.2.0',
    date: 'April 2026',
    tag: 'minor',
    title: 'Notification System & Bulk Actions',
    summary:
      'Real-time notifications arrive instantly via WebSocket. Logistics managers can now act on multiple shipments in one click.',
    highlights: [
      'Real-time notification dropdown with unread badge',
      'Bulk status update for selected shipments',
      'Notification preference centre in Settings',
    ],
    changes: [
      {
        type: 'feature',
        description: 'NotificationDropdown with real-time WebSocket delivery and bulk-mark-read.',
      },
      {
        type: 'feature',
        description: 'BulkActionBar for multi-shipment status updates and exports.',
      },
      {
        type: 'feature',
        description: 'NotificationPreferences page in Settings for granular alert control.',
      },
      {
        type: 'improvement',
        description: 'Notification toasts now group similar events to prevent flooding.',
      },
    ],
  },
  {
    version: '1.1.0',
    date: 'March 2026',
    tag: 'minor',
    title: 'Blockchain Ledger & Milestone Tracking',
    summary:
      'Every on-chain event is now browsable in the Blockchain Ledger page. Milestone timelines show verified Soroban transactions alongside IoT sensor data.',
    highlights: [
      'Blockchain Ledger page with filterable on-chain events',
      'MilestoneTimeline with Soroban transaction links',
      'IoT sensor snapshot cards on shipment detail',
    ],
    changes: [
      {
        type: 'feature',
        description: 'Blockchain Ledger page listing all Soroban contract events with hash linking.',
      },
      {
        type: 'feature',
        description: 'MilestoneTimeline component renders verified vs. pending milestones.',
      },
      {
        type: 'feature',
        description: 'SensorDataCards display latest temperature, humidity, and shock readings.',
      },
      {
        type: 'security',
        description: 'Wallet connect button now validates network before signing transactions.',
      },
    ],
  },
  {
    version: '1.0.0',
    date: 'February 2026',
    tag: 'major',
    title: 'Initial Release',
    summary:
      'Navin\'s first public release — a blockchain-powered logistics platform connecting logistics companies with their customers through real-time, immutable shipment data.',
    highlights: [
      'Company and Customer dashboards',
      'Shipment creation, tracking, and status updates',
      'Stellar Soroban smart contract settlement integration',
      'Role-based access control (Company / Customer)',
    ],
    changes: [
      {
        type: 'feature',
        description: 'Company Dashboard with fleet statistics, recent shipments, and quick actions.',
      },
      {
        type: 'feature',
        description: 'Customer Dashboard showing active shipments and delivery history.',
      },
      {
        type: 'feature',
        description: 'Shipment creation form with origin/destination, route assignment, and milestone config.',
      },
      {
        type: 'feature',
        description: 'Automated settlement tracking via Stellar Soroban smart contracts.',
      },
      {
        type: 'feature',
        description: 'Role-based routing: company and customer portals with separate navigation.',
      },
    ],
  },
];

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Dashboard: <BarChart2 size={16} className="text-[#62ffff]" />,
  Shipment: <Truck size={16} className="text-[#3b82f6]" />,
  Notification: <Bell size={16} className="text-[#f59e0b]" />,
  Security: <Shield size={16} className="text-[#ef4444]" />,
  Settings: <Settings size={16} className="text-[#94a3b8]" />,
};

const getSectionIcon = (description: string): React.ReactNode => {
  for (const [key, icon] of Object.entries(SECTION_ICONS)) {
    if (description.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return <Zap size={16} className="text-[#94a3b8]" />;
};

interface ReleaseCardProps {
  release: ReleaseNote;
  isLatest: boolean;
  defaultExpanded: boolean;
}

const ReleaseCard: React.FC<ReleaseCardProps> = ({
  release,
  isLatest,
  defaultExpanded,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <article
      className="bg-[#14171e] border border-[rgba(30,41,59,0.7)] rounded-xl overflow-hidden transition-all"
      aria-label={`Release ${release.version}`}
    >
      {/* Card header */}
      <button
        type="button"
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#62ffff]"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Version badge */}
          <div className="shrink-0 mt-0.5">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${TAG_STYLES[release.tag]}`}
            >
              {isLatest && <Star size={10} className="fill-current" />}
              v{release.version}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-white m-0 leading-tight">
                {release.title}
              </h3>
              {isLatest && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(98,255,255,0.12)] text-[#62ffff] border border-[rgba(98,255,255,0.25)] uppercase tracking-wide">
                  <Sparkles size={9} />
                  Latest
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748b] mt-1 m-0">{release.date}</p>
            {!expanded && (
              <p className="text-sm text-[#94a3b8] mt-2 m-0 line-clamp-2 max-w-xl">
                {release.summary}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 text-[#64748b] mt-1">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-6 pb-6 pt-0">
          <p className="text-sm text-[#94a3b8] leading-relaxed mb-5 mt-1">{release.summary}</p>

          {/* Highlights */}
          {release.highlights && release.highlights.length > 0 && (
            <div className="mb-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b] mb-3">
                Highlights
              </h4>
              <ul className="space-y-2 m-0 pl-0 list-none">
                {release.highlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#cbd5e1]">
                    <CheckCircle2
                      size={15}
                      className="text-[#10b981] shrink-0 mt-[1px]"
                    />
                    {hl}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Changes list */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b] mb-3">
              Changes
            </h4>
            <ul className="space-y-2.5 m-0 pl-0 list-none">
              {release.changes.map((change, i) => {
                const style = CHANGE_TYPE_STYLES[change.type];
                return (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className={`shrink-0 mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.className}`}
                    >
                      {CHANGE_TYPE_ICONS[change.type]}
                      {style.label}
                    </span>
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="shrink-0" aria-hidden="true">
                        {getSectionIcon(change.description)}
                      </span>
                      <span className="text-sm text-[#cbd5e1] leading-relaxed">
                        {change.description}
                      </span>
                      {change.issueNumber && (
                        <a
                          href={`https://github.com/Navin-xmr/navin-frontend/issues/${change.issueNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-0.5 text-xs text-[#3b82f6] no-underline hover:underline font-medium"
                          aria-label={`Issue #${change.issueNumber}`}
                        >
                          #{change.issueNumber}
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
};

const WhatsNewPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | ReleaseChange['type']>('all');

  const filteredReleases = filter === 'all'
    ? RELEASE_NOTES
    : RELEASE_NOTES.filter((r) =>
        r.changes.some((c) => c.type === filter)
      );

  const filterOptions: { label: string; value: typeof filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Features', value: 'feature' },
    { label: 'Improvements', value: 'improvement' },
    { label: 'Bug Fixes', value: 'fix' },
    { label: 'Security', value: 'security' },
  ];

  return (
    <div className="font-sans text-white bg-transparent w-full max-w-[900px] mx-auto min-h-[calc(100vh-72px)] px-[46px] py-6 flex flex-col gap-8 max-md:px-4 max-md:pb-[90px]">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[rgba(98,255,255,0.08)] border border-[rgba(98,255,255,0.2)] rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-[#62ffff]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight m-0 mb-0.5">
              What's New
            </h1>
            <p className="text-[#94a3b8] text-sm m-0">
              Release notes and platform updates for Navin
            </p>
          </div>
        </div>
      </div>

      {/* Latest release banner */}
      <div className="bg-[rgba(98,255,255,0.04)] border border-[rgba(98,255,255,0.2)] rounded-xl px-6 py-5">
        <div className="flex items-start gap-4 max-md:flex-col">
          <div className="w-10 h-10 bg-[rgba(98,255,255,0.1)] rounded-xl flex items-center justify-center shrink-0">
            <Star size={20} className="text-[#62ffff]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#62ffff]">
                Latest Release
              </span>
              <span className="text-[10px] text-[#64748b]">·</span>
              <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">
                v{RELEASE_NOTES[0].version} — {RELEASE_NOTES[0].date}
              </span>
            </div>
            <h2 className="text-base font-bold text-white m-0 mb-1">
              {RELEASE_NOTES[0].title}
            </h2>
            <p className="text-sm text-[#94a3b8] m-0 leading-relaxed max-w-2xl">
              {RELEASE_NOTES[0].summary}
            </p>
            {RELEASE_NOTES[0].highlights && (
              <ul className="mt-3 space-y-1.5 m-0 pl-0 list-none">
                {RELEASE_NOTES[0].highlights.slice(0, 3).map((hl, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#cbd5e1]">
                    <CheckCircle2 size={13} className="text-[#10b981] shrink-0" />
                    {hl}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter releases by type">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === opt.value
                ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                : 'bg-[#14171e] border-[#1e293b] text-[#94a3b8] hover:border-[#334155] hover:text-white'
            }`}
            aria-pressed={filter === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Release notes list */}
      <div className="flex flex-col gap-4">
        {filteredReleases.length === 0 ? (
          <div className="bg-[#14171e] border border-[rgba(30,41,59,0.7)] rounded-xl px-6 py-12 flex flex-col items-center text-center gap-3">
            <Sparkles size={32} className="text-[#334155]" />
            <p className="text-sm text-[#94a3b8] m-0">
              No releases match this filter.
            </p>
          </div>
        ) : (
          filteredReleases.map((release, idx) => (
            <ReleaseCard
              key={release.version}
              release={release}
              isLatest={idx === 0 && filter === 'all'}
              defaultExpanded={idx === 0}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-[rgba(30,41,59,0.5)]">
        <p className="text-xs text-[#64748b] m-0">
          View the full changelog and open issues on{' '}
          <a
            href="https://github.com/Navin-xmr/navin-frontend/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3b82f6] no-underline hover:underline font-medium"
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
};

export default WhatsNewPage;
