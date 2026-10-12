import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { authApi } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

export interface EmailVerificationProps {}

const COOLDOWN_SECONDS = 60;

const EmailVerification: React.FC<EmailVerificationProps> = () => {
  const { t } = useTranslation("auth");
  const location = useLocation();
  const { addToast } = useToast();

  const initialEmail = (location.state?.email as string | undefined) ?? "";
  const [email, setEmail] = useState<string>(initialEmail);
  const [inputEmail, setInputEmail] = useState<string>(initialEmail);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [inputError, setInputError] = useState<string>("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email || inputEmail.trim();

    if (!targetEmail) {
      setInputError(t("emailVerification.emailRequired", "Please enter your email address"));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(targetEmail)) {
      setInputError(t("signup.errorEmailInvalid", "Please enter a valid email address"));
      return;
    }

    setInputError("");
    setIsResending(true);

    try {
      await authApi.resendVerification({ email: targetEmail });
      setEmail(targetEmail);
      setCooldown(COOLDOWN_SECONDS);
      addToast(
        t("emailVerification.resendSuccess", "Verification email resent successfully."),
        "success"
      );
    } catch {
      addToast(
        t("emailVerification.resendFailed", "Failed to resend verification email. Please try again."),
        "error"
      );
    } finally {
      setIsResending(false);
    }
  };

  const isButtonDisabled = isResending || cooldown > 0 || (!email && !inputEmail.trim());

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden font-sans">
      <div
        className="absolute w-[500px] h-[500px] top-[-250px] right-[-100px] z-0 pointer-events-none"
        style={{ background: "radial-gradient(rgba(0,218,193,0.4), rgba(0,218,193,0))" }}
      />
      <div
        className="absolute w-[600px] h-[600px] bottom-[-300px] left-[-200px] z-0 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, #16abff33 0deg, #0885ff33 55deg, #54d6ff33 120deg, #0071ff33 160deg, transparent 360deg)",
        }}
      />

      <div className="bg-[rgba(20,20,20,0.7)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-10 w-full max-w-[480px] z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] sm:p-8 sm:rounded-none sm:min-h-screen sm:flex sm:flex-col sm:justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 bg-[rgba(0,218,193,0.1)] p-5 rounded-full inline-flex items-center justify-center">
            <CheckCircle2 size={64} className="text-[#00DAC1]" />
          </div>

          <h2 className="text-[2rem] font-bold mb-2 bg-[linear-gradient(135deg,#fff_0%,#00DAC1_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            {t("emailVerification.title", "Check your email")}
          </h2>

          <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem] mb-2">
            {t("emailVerification.subtitle", "We sent a verification link to")}
          </p>

          {email ? (
            <p className="text-white font-semibold text-[0.95rem] mb-4 flex items-center gap-2">
              <Mail size={16} className="text-[#00DAC1]" />
              {email}
            </p>
          ) : (
            <div className="w-full mb-4 text-left">
              <p className="text-xs text-[rgba(255,255,255,0.6)] mb-2 text-center">
                {t("emailVerification.enterEmailPrompt", "Enter your email to receive a new verification link:")}
              </p>
              <div className="relative">
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => {
                    setInputEmail(e.target.value);
                    if (inputError) setInputError("");
                  }}
                  placeholder={t("emailVerification.emailPlaceholder", "Enter your account email")}
                  aria-label={t("emailVerification.emailLabel", "Email address")}
                  className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#00DAC1] ${
                    inputError ? "border-[#FF4D4D]" : "border-[rgba(255,255,255,0.1)]"
                  }`}
                />
              </div>
              {inputError && (
                <span className="text-[#FF4D4D] text-xs mt-1 block" role="alert">
                  {inputError}
                </span>
              )}
            </div>
          )}

          <p className="text-[rgba(255,255,255,0.5)] text-[0.875rem] mb-6 leading-relaxed">
            {t(
              "emailVerification.description",
              "Click the link in your inbox to verify your email address and activate your company account. The link expires in 24 hours."
            )}
          </p>

          {/* Resend Action */}
          <form onSubmit={handleResend} className="w-full mb-4">
            <button
              type="submit"
              disabled={isButtonDisabled}
              aria-label="Resend verification email"
              className="w-full bg-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.15)] text-white rounded-xl py-3 text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={isResending ? "animate-spin" : ""} />
              {isResending
                ? t("emailVerification.resending", "Resending...")
                : cooldown > 0
                ? t("emailVerification.resendCooldown", `Resend in ${cooldown}s`, { seconds: cooldown })
                : t("emailVerification.resendButton", "Resend verification email")}
            </button>
          </form>

          <Link
            to="/login"
            className="w-full bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold no-underline transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,218,193,0.4)]"
          >
            <ArrowLeft size={20} /> {t("emailVerification.backToLogin", "Back to Login")}
          </Link>

          <p className="text-[rgba(255,255,255,0.4)] text-[0.8rem] mt-6">
            {t("emailVerification.didntReceive", "Didn't receive it?")}{" "}
            <Link
              to="/register/company"
              className="text-[#00DAC1] no-underline font-semibold hover:underline"
            >
              {t("emailVerification.tryAgain", "Try again")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
