import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, Wallet, Database, Download, BarChart3, Keyboard } from 'lucide-react';
import { useKeyboardShortcuts } from '../../../../hooks/useKeyboardShortcuts';

export interface QuickActionsCardProps {}

interface Action {
  label: string;
  route: string;
  icon: ReactNode;
  shortcut: string;
  shortcutKey: string;
}

const iconClass = 'w-4 h-4 text-[#00DAC1]';

const ACTIONS: Action[] = [
  { label: 'Create Shipment',    route: '/dashboard/shipments/create',  icon: <Plus className={iconClass} />,          shortcut: 'Alt+N', shortcutKey: 'n' },
  { label: 'View Anomalies',     route: '/dashboard/anomalies',          icon: <AlertTriangle className={iconClass} />, shortcut: 'Alt+A', shortcutKey: 'a' },
  { label: 'Open Settlements',   route: '/dashboard/settlements',        icon: <Wallet className={iconClass} />,        shortcut: 'Alt+S', shortcutKey: 's' },
  { label: 'Blockchain Ledger',  route: '/dashboard/blockchain-ledger',  icon: <Database className={iconClass} />,      shortcut: 'Alt+B', shortcutKey: 'b' },
  { label: 'Export Shipments',   route: '/dashboard/export',             icon: <Download className={iconClass} />,      shortcut: 'Alt+E', shortcutKey: 'e' },
  { label: 'Analytics',          route: '/dashboard/analytics',          icon: <BarChart3 className={iconClass} />,     shortcut: 'Alt+L', shortcutKey: 'l' },
];

export function QuickActionsCard(_props: QuickActionsCardProps) {
  const navigate = useNavigate();

  useKeyboardShortcuts(
    ACTIONS.map((a) => ({
      key: a.shortcutKey,
      alt: true,
      callback: () => navigate(a.route),
      label: a.label,
    }))
  );

  return (
    <div className="bg-[#14171e] border border-[#1e293b] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-sm">Quick Actions</h2>
        <span className="flex items-center gap-1 text-[#94a3b8] text-[11px]">
          <Keyboard className="w-3 h-3" />
          keyboard shortcuts enabled
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {ACTIONS.map((action) => (
          <div
            key={action.route}
            className="border border-[#1e293b] rounded-lg px-3 py-2 hover:bg-[rgba(19,186,186,0.08)] hover:border-[rgba(98,255,255,0.2)] transition-colors"
          >
            <Link to={action.route} className="flex items-center gap-3">
              <span className="flex-shrink-0">{action.icon}</span>
              <span className="flex-1 text-[#cbd5e1] text-sm">{action.label}</span>
              <kbd className="text-[10px] font-mono bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded px-1.5 py-0.5 text-[#94a3b8]">
                {action.shortcut}
              </kbd>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
