import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export interface SmsVerificationProps {
  phoneVerified: boolean;
  phone: string;
  otp: string;
  otpSent: boolean;
  otpLoading: boolean;
  verifyLoading: boolean;
  phoneError: string;
  onPhoneChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
}

const SmsVerification: React.FC<SmsVerificationProps> = ({
  phoneVerified,
  phone,
  otp,
  otpSent,
  otpLoading,
  verifyLoading,
  phoneError,
  onPhoneChange,
  onOtpChange,
  onSendOtp,
  onVerifyOtp,
}) => (
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
            onChange={(e) => onPhoneChange(e.target.value)}
            aria-label="Phone number"
            disabled={otpSent}
          />
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#CBD5E1] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-[#293548] hover:border-[#475569] disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onSendOtp}
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
              onChange={(e) => onOtpChange(e.target.value)}
              aria-label="Verification code"
              inputMode="numeric"
              maxLength={6}
            />
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 bg-[rgba(59,130,246,0.15)] border border-[#3B82F6] rounded-lg text-[#60A5FA] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-[rgba(59,130,246,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onVerifyOtp}
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
);

export default SmsVerification;
