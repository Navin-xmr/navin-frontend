import React from 'react';
import { Clock, Mail, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import type { Invitation } from '@services/api';

export interface PendingInvitationsProps {
  invitations: Invitation[];
  loading: boolean;
  actionLoading: string | null;
  onResend: (id: string, email: string) => void;
  onRevoke: (id: string, email: string) => void;
}

const PendingInvitations: React.FC<PendingInvitationsProps> = ({
  invitations,
  loading,
  actionLoading,
  onResend,
  onRevoke,
}) => {
  if (!loading && invitations.length === 0) return null;

  return (
    <div className="bg-[#14171e] border border-[#2d3748] border-l-[3px] border-l-amber-400 rounded-[10px] px-5 py-4 mb-5">
      <div className="flex items-center mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-100 m-0">Pending Invitations</h2>
          <span className="inline-flex items-center justify-center bg-[rgba(245,158,11,0.15)] text-amber-400 rounded-full text-[11px] font-bold px-[7px] py-px min-w-[20px]">
            {invitations.length}
          </span>
        </div>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-4 text-slate-400 gap-3">
          <Loader2 className="animate-spin" size={20} />
          <p className="m-0 text-sm">Loading…</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {invitations.map((inv) => (
            <div key={inv._id} className="flex items-center justify-between bg-[rgba(30,41,59,0.4)] border border-[#1E293B] rounded-lg px-[14px] py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[rgba(245,158,11,0.1)] rounded-full flex items-center justify-center text-amber-400 shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <span className="text-[13px] font-medium text-slate-200 mr-2">{inv.email}</span>
                  <span className="text-[11px] font-medium text-slate-400 bg-[#1e293b] rounded px-2 py-0.5">{inv.role}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-[5px] border-none rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[rgba(59,130,246,0.1)] text-blue-400 hover:bg-[rgba(59,130,246,0.2)]"
                  disabled={actionLoading === `resend-${inv._id}`}
                  onClick={() => onResend(inv._id, inv.email)}
                >
                  {actionLoading === `resend-${inv._id}` ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Resend
                </button>
                <button
                  className="flex items-center gap-[5px] border-none rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[rgba(239,68,68,0.08)] text-red-400 hover:bg-[rgba(239,68,68,0.15)]"
                  disabled={actionLoading === `revoke-${inv._id}`}
                  onClick={() => onRevoke(inv._id, inv.email)}
                >
                  {actionLoading === `revoke-${inv._id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingInvitations;
