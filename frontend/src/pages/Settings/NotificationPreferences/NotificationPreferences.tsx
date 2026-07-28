import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, Loader2 } from 'lucide-react';
import {
  type NotificationChannel,
  type NotificationEventType,
  type PreferencesMap,
  notificationPreferencesApi,
} from '@services/api/endpoints/notifications';

// ---------- Data ----------

interface EventDef {
  event: NotificationEventType;
  label: string;
}

interface CategoryDef {
  label: string;
  events: EventDef[];
}

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

const defaultPreferences = (): PreferencesMap =>
  Object.fromEntries(ALL_EVENTS.map((e) => [e, { email: false, sms: false }])) as PreferencesMap;

// ---------- Component ----------

const NotificationPreferences: React.FC = () => {
  const [prefs, setPrefs] = useState<PreferencesMap>(defaultPreferences);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [savedEvent, setSavedEvent] = useState<NotificationEventType | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      .then((data) => setPrefs(data))
      .catch(() => {/* keep defaults on error */})
      .finally(() => setLoadingInitial(false));
  }, []);

  const showSaved = useCallback((event: NotificationEventType) => {
    setSavedEvent(event);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSavedEvent(null), 2500);
  }, []);

  const handleToggle = async (event: NotificationEventType, channel: NotificationChannel) => {
    const prev = prefs[event][channel];
    const next = !prev;

    // Optimistic update
    setPrefs((p) => ({ ...p, [event]: { ...p[event], [channel]: next } }));

    try {
      await notificationPreferencesApi.updatePreference(event, channel, next);
      showSaved(event);
    } catch {
      // Roll back
      setPrefs((p) => ({ ...p, [event]: { ...p[event], [channel]: prev } }));
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

  const sliderTrackCls =
    'absolute inset-0 rounded-full bg-slate-800 border border-slate-700 transition-colors duration-300 peer-checked:bg-blue-500/10 peer-checked:border-blue-500';
  const sliderThumbCls =
    'absolute h-[18px] w-[18px] left-0.5 bottom-0.5 rounded-full bg-slate-400 transition-transform duration-300 peer-checked:bg-blue-500 peer-checked:translate-x-5 pointer-events-none';

  if (loadingInitial) {
    return (
      <section
        className="flex items-center justify-center gap-2.5 py-12 px-6 bg-[#14171e] border border-slate-800 rounded-xl overflow-hidden w-full text-slate-500 text-sm"
        aria-label="Loading notification preferences"
      >
        <Loader2 className="animate-spin" size={24} />
        <span>Loading preferences…</span>
      </section>
    );
  }

  return (
    <section
      className="bg-[#14171e] border border-slate-800 rounded-xl overflow-hidden w-full"
      aria-labelledby="notification-preferences-title"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-6 sm:px-6 border-b border-slate-800">
        <Bell className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg shrink-0" size={24} />
        <div>
          <h2 id="notification-preferences-title" className="text-lg font-semibold text-slate-100 mb-1">
            Notification Preferences
          </h2>
          <p className="text-[13px] text-slate-500">
            Choose which events you want to be notified about, and through which channels.
          </p>
        </div>
      </div>

      {/* Phone verification */}
      <div className="px-4 py-4 sm:px-6 border-b border-slate-800 bg-slate-800/30">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-sm font-semibold text-slate-200">SMS Notifications</span>
          {phoneVerified ? (
            <span className="flex items-center gap-1 text-emerald-500 text-xs font-medium" aria-label="Phone verified">
              <CheckCircle2 size={14} /> Verified
            </span>
          ) : (
            <span className="text-xs text-amber-500">Phone verification required to enable SMS</span>
          )}
        </div>

        {!phoneVerified && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="tel"
                className="flex-1 min-w-0 bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm outline-none transition-colors focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="+1 555 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label="Phone number"
                disabled={otpSent}
              />
              <button
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-[13px] font-medium cursor-pointer whitespace-nowrap transition-colors hover:enabled:bg-slate-700 hover:enabled:border-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSendOtp}
                disabled={otpLoading || otpSent}
                aria-label="Send OTP"
              >
                {otpLoading ? <Loader2 className="animate-spin" size={14} /> : null}
                {otpSent ? 'OTP Sent' : 'Send OTP'}
              </button>
            </div>

            {otpSent && (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 min-w-0 bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm outline-none transition-colors focus:border-blue-500"
                  placeholder="Enter verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  aria-label="Verification code"
                  inputMode="numeric"
                  maxLength={6}
                />
                <button
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/15 border border-blue-500 rounded-lg text-blue-400 text-[13px] font-medium cursor-pointer whitespace-nowrap transition-colors hover:enabled:bg-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleVerifyOtp}
                  disabled={verifyLoading}
                  aria-label="Verify OTP"
                >
                  {verifyLoading ? <Loader2 className="animate-spin" size={14} /> : null}
                  Verify
                </button>
              </div>
            )}

            {phoneError && (
              <p className="text-xs text-red-400 mt-0.5" role="alert">
                {phoneError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Channel header */}
      <div className="flex justify-end gap-5 px-4 pt-2 sm:px-6" aria-hidden="true">
        <span className="w-11 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Email</span>
        <span className="w-11 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide">SMS</span>
      </div>

      {/* Categories */}
      <div className="px-4 pb-2 sm:px-6 flex flex-col">
        {CATEGORIES.map((cat, catIndex) => (
          <div
            key={cat.label}
            className={`py-4 pb-1 ${catIndex > 0 ? 'border-t border-slate-800/60' : ''}`}
          >
            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{cat.label}</h3>
            {cat.events.map(({ event, label }) => (
              <div
                key={event}
                className="flex items-center justify-between py-3 border-b border-slate-800/40 gap-4 last:border-b-0"
              >
                <span className="flex-1 text-[13px] sm:text-sm font-medium text-slate-200">{label}</span>

                <div className="flex items-center gap-5 shrink-0">
                  {/* Email toggle */}
                  <label
                    className="relative inline-block w-11 h-6 shrink-0 cursor-pointer"
                    htmlFor={`${event}-email`}
                  >
                    <input
                      id={`${event}-email`}
                      type="checkbox"
                      className="sr-only peer"
                      checked={prefs[event]?.email ?? false}
                      onChange={() => handleToggle(event, 'email')}
                      aria-label={`${label} email notifications`}
                    />
                    <span className={sliderTrackCls} />
                    <span className={sliderThumbCls} />
                  </label>

                  {/* SMS toggle */}
                  <label
                    className={`relative inline-block w-11 h-6 shrink-0 cursor-pointer ${
                      !phoneVerified ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                    htmlFor={`${event}-sms`}
                    title={!phoneVerified ? 'Verify your phone number to enable SMS' : undefined}
                  >
                    <input
                      id={`${event}-sms`}
                      type="checkbox"
                      className="sr-only peer"
                      checked={prefs[event]?.sms ?? false}
                      onChange={() => handleToggle(event, 'sms')}
                      disabled={!phoneVerified}
                      aria-label={`${label} SMS notifications`}
                      aria-disabled={!phoneVerified}
                    />
                    <span className={sliderTrackCls} />
                    <span className={sliderThumbCls} />
                  </label>

                  {/* Inline saved indicator */}
                  {savedEvent === event && (
                    <span
                      className="flex items-center gap-1 text-xs text-emerald-500 font-medium whitespace-nowrap animate-notif-fade-in"
                      role="status"
                      aria-live="polite"
                    >
                      <CheckCircle2 size={13} /> Saved
                    </span>
                  )}
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
