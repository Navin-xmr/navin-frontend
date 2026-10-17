import React, { useId, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { UserRole } from '@services/api/endpoints/users';
import Modal from '@components/common/Modal/Modal';
import { ROLES, ROLE_INFO } from './types';

export interface TeamInviteModalProps {
  isOpen: boolean;
  email: string;
  role: UserRole;
  sending: boolean;
  error: string;
  onEmailChange: (email: string) => void;
  onRoleChange: (role: UserRole) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const TeamInviteModal: React.FC<TeamInviteModalProps> = ({
  isOpen,
  email,
  role,
  sending,
  error,
  onEmailChange,
  onRoleChange,
  onSubmit,
  onClose,
}) => {
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const inviteEmailId = useId();
  const inviteRoleLabelId = useId();

  const handleClose = () => {
    setShowRoleInfo(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Team Member"
      size="md"
      footer={
        <div className="flex gap-3 w-full justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={sending}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#62ffff] text-black font-semibold text-sm rounded-lg hover:bg-[#4ae8e8] disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send Invitation'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor={inviteEmailId}
            className="block text-sm font-medium text-white mb-1.5"
          >
            Email Address
          </label>
          <input
            id={inviteEmailId}
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="colleague@company.com"
            className="w-full bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span
              id={inviteRoleLabelId}
              className="block text-sm font-medium text-white"
            >
              Role
            </span>
            <button
              onClick={() => setShowRoleInfo((prev) => !prev)}
              className="text-xs text-[#62ffff] hover:text-white"
            >
              {showRoleInfo ? 'Hide details' : 'View role details'}
            </button>
          </div>
          <div
            className="flex gap-2"
            role="group"
            aria-labelledby={inviteRoleLabelId}
          >
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  role === r
                    ? 'bg-[rgba(19,186,186,0.15)] text-[#62ffff] border-[#62ffff]'
                    : 'bg-[rgba(19,186,186,0.05)] text-slate-400 border-[rgba(98,255,255,0.2)] hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {showRoleInfo && (
          <div className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.1)] rounded-lg p-4 space-y-4">
            {ROLES.map((r) => (
              <div key={r}>
                <p className="text-sm font-semibold text-[#62ffff] mb-1">{r}</p>
                <p className="text-xs text-slate-400 mb-1.5">
                  {ROLE_INFO[r].description}
                </p>
                {ROLE_INFO[r].permissions.length > 0 && (
                  <div className="mb-1">
                    <p className="text-xs text-green-400 font-medium mb-0.5">
                      Can:
                    </p>
                    <ul className="text-xs text-slate-400 list-disc list-inside">
                      {ROLE_INFO[r].permissions.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {ROLE_INFO[r].limitations.length > 0 && (
                  <div>
                    <p className="text-xs text-red-400 font-medium mb-0.5">
                      Cannot:
                    </p>
                    <ul className="text-xs text-slate-400 list-disc list-inside">
                      {ROLE_INFO[r].limitations.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TeamInviteModal;
