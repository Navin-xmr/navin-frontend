import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, Loader2 } from 'lucide-react';
import {
  type NotificationChannel,
  type NotificationEventType,
  type PreferencesMap,
  notificationPreferencesApi,
} from '@services/api/endpoints/notifications';
import './NotificationPreferences.css';

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

  if (loadingInitial) {
    return (
      <section className="notif-pref-container notif-pref-loading" aria-label="Loading notification preferences">
        <Loader2 className="notif-spinner" size={24} />
        <span>Loading preferences…</span>
      </section>
    );
  }

  return (
    <section className="notif-pref-container" aria-labelledby="notification-preferences-title">
      {/* Header */}
      <div className="notif-pref-header">
        <Bell className="notif-pref-icon" size={24} />
        <div>
          <h2 id="notification-preferences-title">Notification Preferences</h2>
          <p>Choose which events you want to be notified about, and through which channels.</p>
        </div>
      </div>

      {/* Phone verification */}
      <div className="notif-phone-section">
        <div className="notif-phone-header">
          <span className="notif-phone-title">SMS Notifications</span>
          {phoneVerified ? (
            <span className="notif-phone-verified" aria-label="Phone verified">
              <CheckCircle2 size={14} /> Verified
            </span>
          ) : (
            <span className="notif-phone-unverified">Phone verification required to enable SMS</span>
          )}
        </div>

        {!phoneVerified && (
          <div className="notif-phone-form">
            <div className="notif-phone-row">
              <input
                type="tel"
                className="notif-phone-input"
                placeholder="+1 555 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label="Phone number"
                disabled={otpSent}
              />
              <button
                className="notif-phone-btn"
                onClick={handleSendOtp}
                disabled={otpLoading || otpSent}
                aria-label="Send OTP"
              >
                {otpLoading ? <Loader2 className="notif-spinner" size={14} /> : null}
                {otpSent ? 'OTP Sent' : 'Send OTP'}
              </button>
            </div>

            {otpSent && (
              <div className="notif-phone-row">
                <input
                  type="text"
                  className="notif-phone-input"
                  placeholder="Enter verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  aria-label="Verification code"
                  inputMode="numeric"
                  maxLength={6}
                />
                <button
                  className="notif-phone-btn notif-phone-btn--primary"
                  onClick={handleVerifyOtp}
                  disabled={verifyLoading}
                  aria-label="Verify OTP"
                >
                  {verifyLoading ? <Loader2 className="notif-spinner" size={14} /> : null}
                  Verify
                </button>
              </div>
            )}

            {phoneError && (
              <p className="notif-phone-error" role="alert">
                {phoneError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Channel header */}
      <div className="notif-channel-header" aria-hidden="true">
        <span className="notif-channel-label">Email</span>
        <span className="notif-channel-label">SMS</span>
      </div>

      {/* Categories */}
      <div className="notif-pref-list">
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="notif-category">
            <h3 className="notif-category-title">{cat.label}</h3>
            {cat.events.map(({ event, label }) => (
              <div key={event} className="notif-pref-row">
                <span className="notif-pref-label">{label}</span>

                <div className="notif-pref-toggles">
                  {/* Email toggle */}
                  <label className="notif-switch" htmlFor={`${event}-email`}>
                    <input
                      id={`${event}-email`}
                      type="checkbox"
                      checked={prefs[event]?.email ?? false}
                      onChange={() => handleToggle(event, 'email')}
                      aria-label={`${label} email notifications`}
                    />
                    <span className="notif-slider round" />
                  </label>

                  {/* SMS toggle */}
                  <label
                    className={`notif-switch ${!phoneVerified ? 'notif-switch--disabled' : ''}`}
                    htmlFor={`${event}-sms`}
                    title={!phoneVerified ? 'Verify your phone number to enable SMS' : undefined}
                  >
                    <input
                      id={`${event}-sms`}
                      type="checkbox"
                      checked={prefs[event]?.sms ?? false}
                      onChange={() => handleToggle(event, 'sms')}
                      disabled={!phoneVerified}
                      aria-label={`${label} SMS notifications`}
                      aria-disabled={!phoneVerified}
                    />
                    <span className="notif-slider round" />
                  </label>

                  {/* Inline saved indicator */}
                  {savedEvent === event && (
                    <span className="notif-saved-indicator" role="status" aria-live="polite">
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
