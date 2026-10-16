import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Mail, Shield } from 'lucide-react';
import type { UserRole } from '@services/api/endpoints/users';
import { ROLES } from './types';
import type { TeamMember } from './types';

export interface TeamRoleEditorProps {
  member: TeamMember;
  disabled?: boolean;
  onRoleChange: (member: TeamMember, newRole: UserRole) => void;
}

export const TeamRoleEditor: React.FC<TeamRoleEditorProps> = ({
  member,
  disabled = false,
  onRoleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (member.source !== 'user') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-slate-400">
        <Mail size={14} />
        {member.role}
      </span>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[rgba(19,186,186,0.08)] border border-[rgba(98,255,255,0.2)] rounded-lg text-sm text-white hover:bg-[rgba(19,186,186,0.15)] disabled:opacity-50"
      >
        <Shield size={14} className="text-[#62ffff]" />
        {member.role}
        <ChevronDown size={14} />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-20 w-40 bg-[#1a1f2e] border border-[rgba(98,255,255,0.2)] rounded-lg shadow-xl py-1">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => {
                setIsOpen(false);
                onRoleChange(member, role);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[rgba(19,186,186,0.1)] ${
                member.role === role ? 'text-[#62ffff]' : 'text-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamRoleEditor;
