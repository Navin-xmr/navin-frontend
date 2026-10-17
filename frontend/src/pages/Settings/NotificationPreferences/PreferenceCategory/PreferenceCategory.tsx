import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { NotificationEventType } from '@services/api/endpoints/notifications';
import type { CategoryDef, ExtendedChannel, ExtendedPreferencesMap } from '../types';
import ToggleSwitch from '../ToggleSwitch';

export interface PreferenceCategoryProps {
  category: CategoryDef;
  prefs: ExtendedPreferencesMap;
  phoneVerified: boolean;
  pushEnabled: boolean;
  savedEvent: NotificationEventType | null;
  isFirst: boolean;
  onToggle: (event: NotificationEventType, channel: ExtendedChannel) => void;
  onBulkToggle: (category: CategoryDef, channel: ExtendedChannel, value: boolean) => void;
  isCategoryFullyEnabled: (category: CategoryDef, channel: ExtendedChannel) => boolean;
  isCategoryPartiallyEnabled: (category: CategoryDef, channel: ExtendedChannel) => boolean;
}

const CHANNELS: { key: ExtendedChannel; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
  { key: 'push', label: 'Push' },
];

const PreferenceCategory: React.FC<PreferenceCategoryProps> = ({
  category,
  prefs,
  phoneVerified,
  pushEnabled,
  savedEvent,
  isFirst,
  onToggle,
  onBulkToggle,
  isCategoryFullyEnabled,
  isCategoryPartiallyEnabled,
}) => (
  <div className={`py-4 ${!isFirst ? 'border-t border-[rgba(30,41,59,0.6)]' : ''}`}>
    {/* Category header with bulk toggles */}
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-[0.65rem] font-bold text-slate-600 uppercase tracking-widest m-0">
        {category.label}
      </h3>

      {/* Bulk toggle buttons per channel */}
      <div className="flex items-center gap-0">
        {CHANNELS.map(({ key, label }) => {
          const fullyOn = isCategoryFullyEnabled(category, key);
          const partial = isCategoryPartiallyEnabled(category, key);
          const isDisabled = key === 'sms' && !phoneVerified;
          const isPushDisabled = key === 'push' && !pushEnabled;

          return (
            <div key={key} className="w-[72px] flex justify-center">
              <button
                type="button"
                onClick={() =>
                  !isDisabled &&
                  !isPushDisabled &&
                  onBulkToggle(category, key, !fullyOn)
                }
                disabled={isDisabled || isPushDisabled}
                title={
                  isDisabled
                    ? 'Verify your phone to enable SMS'
                    : isPushDisabled
                    ? 'Enable push notifications first'
                    : fullyOn
                    ? `Disable all ${label} for ${category.label}`
                    : `Enable all ${label} for ${category.label}`
                }
                className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded transition-colors cursor-pointer border ${
                  isDisabled || isPushDisabled
                    ? 'opacity-30 cursor-not-allowed border-transparent text-slate-600'
                    : fullyOn
                    ? 'bg-[rgba(59,130,246,0.15)] border-[#3B82F6]/40 text-[#60A5FA]'
                    : partial
                    ? 'bg-[rgba(251,191,36,0.1)] border-amber-500/30 text-amber-400'
                    : 'bg-transparent border-slate-700/50 text-slate-600 hover:border-slate-500 hover:text-slate-400'
                }`}
                aria-label={`${fullyOn ? 'Disable' : 'Enable'} all ${label} notifications for ${category.label}`}
                aria-pressed={fullyOn}
              >
                {fullyOn ? 'All on' : partial ? 'Partial' : 'All off'}
              </button>
            </div>
          );
        })}
        {/* Spacer to align with saved indicator column */}
        <div className="w-[72px]" />
      </div>
    </div>

    {/* Event rows */}
    {category.events.map(({ event, label }) => (
      <div
        key={event}
        className="flex items-center justify-between py-3 border-b border-[rgba(30,41,59,0.4)] last:border-b-0 gap-4"
      >
        <span className="flex-1 text-sm font-medium text-[#E2E8F0]">{label}</span>

        <div className="flex items-center gap-0 flex-shrink-0">
          {/* Email toggle */}
          <div className="w-[72px] flex justify-center">
            <ToggleSwitch
              id={`${event}-email`}
              checked={prefs[event]?.email ?? false}
              onChange={() => onToggle(event, 'email')}
              ariaLabel={`${label} email notifications`}
            />
          </div>

          {/* SMS toggle */}
          <div className="w-[72px] flex justify-center">
            <ToggleSwitch
              id={`${event}-sms`}
              checked={prefs[event]?.sms ?? false}
              onChange={() => onToggle(event, 'sms')}
              disabled={!phoneVerified}
              ariaLabel={`${label} SMS notifications`}
              title={!phoneVerified ? 'Verify your phone number to enable SMS' : undefined}
            />
          </div>

          {/* Push toggle */}
          <div className="w-[72px] flex justify-center">
            <ToggleSwitch
              id={`${event}-push`}
              checked={prefs[event]?.push ?? false}
              onChange={() => onToggle(event, 'push')}
              disabled={!pushEnabled}
              ariaLabel={`${label} push notifications`}
              title={!pushEnabled ? 'Enable push notifications first' : undefined}
            />
          </div>

          {/* Inline saved indicator */}
          <div className="w-[72px] flex justify-center">
            {savedEvent === event ? (
              <span
                className="flex items-center gap-1 text-emerald-400 text-xs font-medium whitespace-nowrap animate-[fadeInUp_0.25s_ease-out]"
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 size={12} /> Saved
              </span>
            ) : null}
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default PreferenceCategory;
