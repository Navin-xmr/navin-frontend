import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import {
  type NotificationChannel,
  type NotificationEventType,
  type PreferencesMap,
  notificationPreferencesApi,
} from '@services/api/endpoints/notifications';

// ---------- Types ----------

type ExtendedChannel = NotificationChannel | 'push';

interface ExtendedPreference {
  email: boolean;
  sms: boolean;
  push: boolean;
}

type ExtendedPreferencesMap = Record<NotificationEventType, ExtendedPreference>;

interface EventDef {
  event: NotificationEventType;
  label: string;
}

interface CategoryDef {
  label: string;
  events: EventDef[];
}

// ---------- Data ----------

const CATEGORIES: CategoryDef[] = [
  {
    label: 'Shipments',
    events: [
      { event: 'shipment_created', label: 'Shipment Created' },
      { event: 'status_changed', label: 'Status Changed' },
      { event: 'delivery_confirmed', label: 'Delivery Confirmed' },
    ],
  },
  {
    label: 'Payments',
    events: [{ event: 'payment_received', label: 'Payment Received' }],
  },
  {
    label: 'Disputes',
    events: [
      { event: 'dispute_opened', label: 'Dispute Opened' },
      { event: 'dispute_resolved', label: 'Dispute Resolved' },
    ],
  },
];

const ALL_EVENTS = CATEGORIES.flatMap((c) => c.events.map((e) => e.event));

const defaultPreferences = (): ExtendedPreferencesMap =>
  Object.fromEntries(
    ALL_EVENTS.map((e) => [e, { email: false, sms: false, push: false }]),
  ) as ExtendedPreferencesMap;

// ---------- Toggle component ----------

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  ariaLabel: string;
  title?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  disabled = false,
  onChange,
  ariaLabel,
  title,
}) => (
  <label
    htmlFor={id}
    title={title}
    className={`relative inline-block w-11 h-6 flex-shrink-0 ${
      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
    }`}
  >
    <input
      id={id}
      type="checkbox"
      className="sr-only"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    />
    <span
      className={`absolute inset-0 rounded-full border transition-colors duration-300 ${
        checked
          ? 'bg-[rgba(59,130,246,0.15)] border-[#3B82F6]'
          : 'bg-[#1E293B] border-[#334155]'
      }`}
    />
    <span
      className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full transition-all duration-300 ${
        checked
          ? 'translate-x-5 bg-[#3B82F6]'
          : 'translate-x-0 bg-[#94A3B8]'
      }`}
    />
  </label>
);

// ---------- Main Component ----------

const NotificationPreferences: React.FC = () => {
  const [prefs, setPrefs] = useState<ExtendedPreferencesMap>(defaultPreferences);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [savedEvent, setSavedEvent] = useState<NotificationEventType | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Push notification permission state
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushRequesting, setPushRequesting] = useState(false);

  // Phone verification state
  const [phone, setPhone] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    notificationPreferencesApi
      .getPreferences()
      .then((data) => {
        // Merge API response (email/sms) into extended map with push defaulting to false
        setPrefs((prev) => {
          const merged = { ...prev };
          (Object.keys(data) as NotificationEventType[]).forEach((evt) => {
            merged[evt] = { ...merged[evt], email: data[evt].email, sms: data[evt].sms };
          });
          return merged;
        });
      })
      .catch(() => {/* keep defaults on error */})
      .finally(() => setLoadingInitial(false));
  }, []);

  const showSaved = useCallback((event: NotificationEventType) => {
    setSavedEvent(event);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSavedEvent(null), 2500);
  }, []);

  const handleToggle = async (event: NotificationEventType, channel: ExtendedChannel) => {
    const prev = prefs[event][channel];
    const next = !prev;

    // Optimistic update
    setPrefs((p) => ({ ...p, [event]: { ...p[event], [channel]: next } }));

    if (channel === 'push') {
      // Push is local-only — no API call needed until push service is integrated
      showSaved(event);
      return;
    }

    try {
      await notificationPreferencesApi.updatePreference(event, channel as NotificationChannel, next);
      showSaved(event);
    } catch {
      // Roll back
      setPrefs((p) => ({ ...p, [event]: { ...p[event], [channel]: prev } }));
    }
  };

  // Category-level bulk toggle: sets all events in category to the same value for a channel
  const handleCategoryBulkToggle = async (
    category: CategoryDef,
    channel: ExtendedChannel,
    value: boolean,
  ) => {
    const events = category.events.map((e) => e.event);

    // Optimistic update
    setPrefs((p) => {
      const updated = { ...p };
      events.forEach((evt) => {
        updated[evt] = { ...updated[evt], [channel]: value };
      });
      return updated;
    });

    if (channel === 'push') return;

    // Fire API calls in parallel
    await Promise.allSettled(
      events.map((evt) =>
        notificationPreferencesApi.updatePreference(
          evt,
          channel as NotificationChannel,
          value,
        ),
      ),
    );
  };

  const handleRequestPush = async () => {
    if (!('Notification' in window)) return;
    setPushRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      setPushEnabled(permission === 'granted');
    } finally {
      setPushRequesting(false);
    }
  };

  const handleSendOtp = async () => {
    setPhoneError('');
    if (!phone.trim()) {
      setPhoneError('Please enter a phone number.');
      return;
    }
    setOtpLoading(true);
    try {
      await notificationPreferencesApi.sendOtp(phone.trim());
      setOtpSent(true);
    } catch {
      setPhoneError('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setPhoneError('');
    if (!otp.trim()) {
      setPhoneError('Please enter the verification code.');
      return;
    }
    setVerifyLoading(true);
    try {
      await notificationPreferencesApi.verifyOtp(phone.trim(), otp.trim());
      setPhoneVerified(true);
      setOtpSent(false);
      setOtp('');
    } catch {
      setPhoneError('Verification failed. Please check the code and try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Check if all events in a category have a given channel enabled
  const isCategoryFullyEnabled = (category: CategoryDef, channel: ExtendedChannel) =>
    category.events.every((e) => prefs[e.event]?.[channel] === true);

  const isCategoryPartiallyEnabled = (category: CategoryDef, channel: ExtendedChannel) =>
    category.events.some((e) => prefs[e.event]?.[channel] === true) &&
    !isCategoryFullyEnabled(category, channel);

  if (loadingInitial) {
    return (
      <section
        className="flex items-center justify-center gap-3 p-12 bg-[#14171E] border border-[#1E293B] rounded-xl text-slate-500 text-sm"
        aria-label="Loading notification preferences"
      >
        <Loader2 className="animate-spin" size={20} />
        <span>Loading preferences…</span>
      </section>
    );
  }

  const CHANNELS: { key: ExtendedChannel; label: string }[] = [
    { key: 'email', label: 'Email' },
    { key: 'sms', label: 'SMS' },
    { key: 'push', label: 'Push' },
  ];

  return (
    <section
      className="w-full bg-[#14171E] border border-[#1E293B] rounded-xl overflow-hidden"
      aria-labelledby="notification-preferences-title"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1E293B]">
        <div className="p-1.5 rounded-lg bg-[rgba(59,130,246,0.1)] text-[#3B82F6] flex-shrink-0">
          <Bell size={20} />
        </div>
        <div>
          <h2
            id="notification-preferences-title"
            className="text-[#F1F5F9] font-semibold text-[1.05rem] m-0"
          >
            Notification Preferences
          </h2>
          <p className="text-slate-500 text-[0.8rem] m-0 mt-0.5">
            Choose which events you want to be notified about, and through which channels.
          </p>
        </div>
      </div>

      {/* SMS verification */}
      <div className="px-6 py-4 border-b border-[#1E293B] bg-[rgba(30,41,59,0.3)]">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[0.875rem] font-semibold text-[#E2E8F0]">SMS Notifications</span>
          {phoneVerified ? (
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium" aria-label="Phone verified">
              <CheckCircle2 size={13} /> Verified
            </span>
          ) : (
            <span className="text-amber-400 text-xs">Phone verification required to enable SMS</span>
          )}
        </div>

        {!phoneVerified && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="tel"
                className="flex-1 min-w-0 bg-[#0F1117] border border-[#334155] rounded-lg px-3 py-2 text-[#E2E8F0] text-sm outline-none transition-colors focus:border-[#3B82F6] disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="+1 555 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label="Phone number"
                disabled={otpSent}
              />
              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#CBD5E1] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-[#293548] hover:border-[#475569] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSendOtp}
                disabled={otpLoading || otpSent}
                aria-label="Send OTP"
              >
                {otpLoading && <Loader2 className="animate-spin" size={13} />}
                {otpSent ? 'OTP Sent' : 'Send OTP'}
              </button>
            </div>

            {otpSent && (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 min-w-0 bg-[#0F1117] border border-[#334155] rounded-lg px-3 py-2 text-[#E2E8F0] text-sm outline-none transition-colors focus:border-[#3B82F6]"
                  placeholder="Enter verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  aria-label="Verification code"
                  inputMode="numeric"
                  maxLength={6}
                />
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[rgba(59,130,246,0.15)] border border-[#3B82F6] rounded-lg text-[#60A5FA] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-[rgba(59,130,246,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleVerifyOtp}
                  disabled={verifyLoading}
                  aria-label="Verify OTP"
                >
                  {verifyLoading && <Loader2 className="animate-spin" size={13} />}
                  Verify
                </button>
              </div>
            )}

            {phoneError && (
              <p className="text-[#F87171] text-xs mt-1" role="alert">{phoneError}</p>
            )}
          </div>
        )}
      </div>

      {/* Push notification opt-in */}
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
              onClick={handleRequestPush}
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

      {/* Column headers */}
      <div className="flex justify-end gap-0 px-6 pt-3 pb-0" aria-hidden="true">
        {CHANNELS.map(({ key, label }) => (
          <div key={key} className="w-[72px] text-center text-[0.65rem] font-semibold text-slate-600 uppercase tracking-wider">
            {label}
          </div>
        ))}
        {/* Extra space for the saved indicator */}
        <div className="w-[72px]" />
      </div>

      {/* Categories */}
      <div className="px-6 pb-4">
        {CATEGORIES.map((cat, catIndex) => (
          <div
            key={cat.label}
            className={`py-4 ${catIndex > 0 ? 'border-t border-[rgba(30,41,59,0.6)]' : ''}`}
          >
            {/* Category header with bulk toggles */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[0.65rem] font-bold text-slate-600 uppercase tracking-widest m-0">
                {cat.label}
              </h3>

              {/* Bulk toggle buttons per channel */}
              <div className="flex items-center gap-0">
                {CHANNELS.map(({ key, label }) => {
                  const fullyOn = isCategoryFullyEnabled(cat, key);
                  const partial = isCategoryPartiallyEnabled(cat, key);
                  const isDisabled = key === 'sms' && !phoneVerified;
                  const isPushDisabled = key === 'push' && !pushEnabled;

                  return (
                    <div key={key} className="w-[72px] flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          !isDisabled &&
                          !isPushDisabled &&
                          handleCategoryBulkToggle(cat, key, !fullyOn)
                        }
                        disabled={isDisabled || isPushDisabled}
                        title={
                          isDisabled
                            ? 'Verify your phone to enable SMS'
                            : isPushDisabled
                            ? 'Enable push notifications first'
                            : fullyOn
                            ? `Disable all ${label} for ${cat.label}`
                            : `Enable all ${label} for ${cat.label}`
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
                        aria-label={`${fullyOn ? 'Disable' : 'Enable'} all ${label} notifications for ${cat.label}`}
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
            {cat.events.map(({ event, label }) => (
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
                      onChange={() => handleToggle(event, 'email')}
                      ariaLabel={`${label} email notifications`}
                    />
                  </div>

                  {/* SMS toggle */}
                  <div className="w-[72px] flex justify-center">
                    <ToggleSwitch
                      id={`${event}-sms`}
                      checked={prefs[event]?.sms ?? false}
                      onChange={() => handleToggle(event, 'sms')}
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
                      onChange={() => handleToggle(event, 'push')}
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
        ))}
      </div>
    </section>
  );
};

export default NotificationPreferences;
