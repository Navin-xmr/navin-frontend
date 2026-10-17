import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import {
  type NotificationChannel,
  type NotificationEventType,
  notificationPreferencesApi,
} from '@services/api/endpoints/notifications';
import type { ExtendedChannel, ExtendedPreferencesMap, CategoryDef } from './types';
import { CATEGORIES, defaultPreferences } from './preferenceData';
import SmsVerification from './SmsVerification';
import PushOptIn from './PushOptIn';
import PreferenceCategory from './PreferenceCategory';

const CHANNELS: { key: ExtendedChannel; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
  { key: 'push', label: 'Push' },
];

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
      <SmsVerification
        phoneVerified={phoneVerified}
        phone={phone}
        otp={otp}
        otpSent={otpSent}
        otpLoading={otpLoading}
        verifyLoading={verifyLoading}
        phoneError={phoneError}
        onPhoneChange={setPhone}
        onOtpChange={setOtp}
        onSendOtp={handleSendOtp}
        onVerifyOtp={handleVerifyOtp}
      />

      {/* Push notification opt-in */}
      <PushOptIn
        pushEnabled={pushEnabled}
        pushRequesting={pushRequesting}
        onRequestPush={handleRequestPush}
      />

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
          <PreferenceCategory
            key={cat.label}
            category={cat}
            prefs={prefs}
            phoneVerified={phoneVerified}
            pushEnabled={pushEnabled}
            savedEvent={savedEvent}
            isFirst={catIndex === 0}
            onToggle={handleToggle}
            onBulkToggle={handleCategoryBulkToggle}
            isCategoryFullyEnabled={isCategoryFullyEnabled}
            isCategoryPartiallyEnabled={isCategoryPartiallyEnabled}
          />
        ))}
      </div>
    </section>
  );
};

export default NotificationPreferences;
