import React from 'react';
import {
  Zap,
  Shield,
  Truck,
  BarChart2,
  Bell,
  Settings,
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

export const CHANGE_TYPE_STYLES: Record<
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

export const TAG_STYLES: Record<ReleaseNote['tag'], string> = {
  major: 'bg-[rgba(98,255,255,0.12)] text-[#62ffff] border border-[rgba(98,255,255,0.25)]',
  minor: 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa] border border-[rgba(59,130,246,0.25)]',
  patch: 'bg-[rgba(100,116,139,0.12)] text-[#94a3b8] border border-[rgba(100,116,139,0.25)]',
};

export const CHANGE_TYPE_ICONS: Record<ReleaseChange['type'], React.ReactNode> = {
  feature: <Star size={13} />,
  improvement: <Zap size={13} />,
  fix: <CheckCircle2 size={13} />,
  security: <Shield size={13} />,
};

// Curated release notes — these represent Navin's shipped improvements
export const RELEASE_NOTES: ReleaseNote[] = [
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
      "What's New release notes section — you're reading it!",
    ],
    changes: [
      {
        type: 'feature',
        description: 'Added Recent Activity panel to dashboard home showing grouped shipment events.',
        issueNumber: 525,
      },
      {
        type: 'feature',
        description: "Added What's New / Release Notes section accessible from the sidebar.",
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
      "Navin's first public release — a blockchain-powered logistics platform connecting logistics companies with their customers through real-time, immutable shipment data.",
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

export const SECTION_ICONS: Record<string, React.ReactNode> = {
  Dashboard: <BarChart2 size={16} className="text-[#62ffff]" />,
  Shipment: <Truck size={16} className="text-accent-blue" />,
  Notification: <Bell size={16} className="text-[#f59e0b]" />,
  Security: <Shield size={16} className="text-accent-red" />,
  Settings: <Settings size={16} className="text-[#94a3b8]" />,
};

export const getSectionIcon = (description: string): React.ReactNode => {
  for (const [key, icon] of Object.entries(SECTION_ICONS)) {
    if (description.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return <Zap size={16} className="text-[#94a3b8]" />;
};
