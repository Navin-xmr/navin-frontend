import React from 'react';

export interface PasswordStrengthMeterProps {
  password: string;
}

interface Criterion {
  label: string;
  met: boolean;
}

interface Level {
  label: string;
  segments: number;
  color: string;
  textColor: string;
}

function getLevel(criteria: Criterion[]): Level {
  const met = criteria.filter((c) => c.met).length;
  if (met === 0) return { label: 'Weak', segments: 1, color: 'bg-red-500', textColor: 'text-red-400' };
  if (met === 1) return { label: 'Weak', segments: 1, color: 'bg-red-500', textColor: 'text-red-400' };
  if (met === 2) return { label: 'Fair', segments: 2, color: 'bg-orange-400', textColor: 'text-orange-400' };
  if (met === 3) return { label: 'Good', segments: 3, color: 'bg-yellow-400', textColor: 'text-yellow-400' };
  return { label: 'Strong', segments: 4, color: 'bg-green-400', textColor: 'text-green-400' };
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const criteria: Criterion[] = [
    { label: 'At least 12 characters', met: password.length >= 12 },
    { label: 'An uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'A number', met: /[0-9]/.test(password) },
    { label: 'A special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const level = getLevel(criteria);
  const unmet = criteria.filter((c) => !c.met);

  return (
    <div className="mt-2 space-y-1.5">
      {/* 4-segment bar */}
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < level.segments ? level.color : 'bg-[rgba(255,255,255,0.1)]'
            }`}
          />
        ))}
      </div>

      {/* Level label */}
      <p className={`text-xs font-medium ${level.textColor}`}>{level.label}</p>

      {/* Unmet criteria */}
      {unmet.length > 0 && (
        <ul className="space-y-0.5">
          {unmet.map((c) => (
            <li key={c.label} className="text-xs text-[rgba(255,255,255,0.45)]">
              Add {c.label.charAt(0).toLowerCase() + c.label.slice(1)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
