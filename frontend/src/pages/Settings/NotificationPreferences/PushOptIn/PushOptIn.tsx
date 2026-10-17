import React from 'react';
import { CheckCircle2, Loader2, Smartphone } from 'lucide-react';

export interface PushOptInProps {
  pushEnabled: boolean;
  pushRequesting: boolean;
  onRequestPush: () => void;
}

const PushOptIn: React.FC<PushOptInProps> = ({ pushEnabled, pushRequesting, onRequestPush }) => (
  <div className="px-6 py-4 border-b border-[#1E293B] bg-[rgba(30,41,59,0.2)]">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2.5">
        <div className="p-1 rounded-md bg-[rgba(139,92,246,0.15)] text-purple-400">
          <Smartphone size={16} />
        </div>
        <div>
          <span className="text-[0.875rem] font-semibold text-[#E2E8F0]">Push Notifications</span>
          <p className="text-slate-500 text-xs mt-0.5 m-0">
            Receive instant alerts in your browser
          </p>
        </div>
      </div>
      {!pushEnabled ? (
        <button
          type="button"
          onClick={onRequestPush}
          disabled={pushRequesting || !('Notification' in window)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[rgba(139,92,246,0.15)] border border-purple-500/40 rounded-lg text-purple-300 text-sm font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-[rgba(139,92,246,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Enable push notifications"
        >
          {pushRequesting && <Loader2 className="animate-spin" size={13} />}
          Enable Push Notifications
        </button>
      ) : (
        <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
          <CheckCircle2 size={14} /> Enabled
        </span>
      )}
    </div>
  </div>
);

export default PushOptIn;
