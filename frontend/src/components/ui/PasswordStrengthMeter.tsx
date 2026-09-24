import React from 'react';
import {
  PASSWORD_MIN_LENGTH,
  validatePassword,
  getPasswordStrengthLevel,
} from '../../utils/passwordPolicy';

export interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const validation = validatePassword(password);
  const criteria = validation.rules;
  const level = getPasswordStrengthLevel(validation.score);
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
