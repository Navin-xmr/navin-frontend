import React, { useRef } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import type { UserRole } from '@services/api';
import { useFocusTrap } from '../../../../hooks/useFocusTrap';

export type InviteStep = 'form' | 'success';

export interface InviteModalProps {
  isOpen: boolean;
  inviteStep: InviteStep;
  inviteEmail: string;
  inviteRole: UserRole;
  inviteMessage: string;
  lastInvitedEmail: string;
  actionLoading: string | null;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: UserRole) => void;
  onMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onInviteAnother: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  inviteStep,
  inviteEmail,
  inviteRole,
  inviteMessage,
  lastInvitedEmail,
  actionLoading,
  onClose,
  onEmailChange,
  onRoleChange,
  onMessageChange,
  onSubmit,
  onInviteAnother,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
        tabIndex={-1}
        className="bg-[#14171E] border border-[#1E293B] rounded-xl w-full max-w-[460px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] overflow-hidden animate-modal-in max-sm:mx-4 max-sm:w-auto"
      >
        <div className="flex justify-between items-center px-6 py-6 border-b border-[#1E293B]">
          <h2 id="invite-modal-title" className="text-lg font-semibold m-0">
            {inviteStep === 'success' ? 'Invitation Sent!' : 'Invite Team Member'}
          </h2>
          <button
            className="bg-transparent border-none text-slate-400 cursor-pointer p-1 flex rounded hover:bg-[#1E293B] hover:text-slate-100 transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {inviteStep === 'success' ? (
          <div className="px-6 py-6 flex flex-col gap-5 items-center text-center">
            <div className="w-14 h-14 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center text-emerald-400 mb-1">
              <Mail size={32} />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed m-0">
              An invitation has been sent to <strong className="text-slate-100">{lastInvitedEmail}</strong>.
              They'll receive an email with a link to create their account.
            </p>
            <div className="flex justify-end gap-3 mt-3 w-full">
              <button
                type="button"
                className="bg-transparent border border-[#1E293B] text-slate-100 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#1E293B] transition-all"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="bg-blue-500 border-none text-white px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors"
                onClick={onInviteAnother}
              >
                Invite Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="px-6 py-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="inviteEmail" className="text-[13px] font-medium text-slate-400">Email Address *</label>
              <input
                type="email"
                id="inviteEmail"
                value={inviteEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="name@company.com"
                required
                className="bg-[#0b0e14] border border-[#1E293B] rounded-lg px-[14px] py-2.5 text-slate-100 text-sm outline-none font-[inherit] focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="inviteRole" className="text-[13px] font-medium text-slate-400">Role *</label>
              <select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-[#0b0e14] border border-[#1E293B] rounded-lg px-[14px] py-2.5 text-slate-100 text-sm outline-none font-[inherit] focus:border-blue-500 transition-colors [&>option]:bg-[#14171E]"
              >
                <option value="Admin">Admin — Full access</option>
                <option value="Manager">Manager — Edit &amp; View</option>
                <option value="Viewer">Viewer — Read only</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="inviteMessage" className="text-[13px] font-medium text-slate-400">Personal Message (optional)</label>
              <textarea
                id="inviteMessage"
                value={inviteMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="Add a personal note to the invitation email…"
                rows={3}
                className="bg-[#0b0e14] border border-[#1E293B] rounded-lg px-[14px] py-2.5 text-slate-100 text-sm outline-none font-[inherit] focus:border-blue-500 transition-colors resize-y min-h-[72px]"
              />
            </div>
            <div className="flex justify-end gap-3 mt-3">
              <button
                type="button"
                className="bg-transparent border border-[#1E293B] text-slate-100 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#1E293B] transition-all"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!inviteEmail.trim() || actionLoading === 'invite'}
                className="bg-blue-500 border-none text-white px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === 'invite' ? (
                  <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Sending…</span>
                ) : (
                  'Send Invite'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteModal;
