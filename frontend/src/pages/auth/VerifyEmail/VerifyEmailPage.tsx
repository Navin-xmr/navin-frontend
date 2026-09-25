import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { authApi } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

export interface VerifyEmailPageProps {}

type VerificationStatus = "loading" | "success" | "expired" | "missing";

const COOLDOWN_SECONDS = 60;

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = () => {
  const { t } = useTranslation("auth");
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resendEmail, setResendEmail] = useState<string>("");
  const [isResending, setIsResending] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [emailInputError, setEmailInputError] = useState<string>("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  useEffect(() => {
    const rawToken = searchParams.get("token") || (location.state as { token?: string } | null)?.token;

    if (!rawToken) {
      setStatus("missing");
      return;
    }

    // Security best practice: Strip token from address bar and history
    if (searchParams.get("token")) {
      navigate(location.pathname, { replace: true, state: { token: rawToken } });
    }

    const verify = async () => {
      setStatus("loading");
      try {
        await authApi.verifyEmail({ token: rawToken });
        setStatus("success");
      } catch (err: unknown) {
        setStatus("expired");
        const msg =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        if (msg) setErrorMessage(msg);
      }
    };

    void verify();
  }, [searchParams, location.pathname, location.state, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = resendEmail.trim();

    if (!email) {
      setEmailInputError(t("emailVerification.emailRequired", "Please enter your email address"));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailInputError(t("signup.errorEmailInvalid", "Please enter a valid email address"));
      return;
    }

    setEmailInputError("");
    setIsResending(true);

    try {
      await authApi.resendVerification({ email });
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
          {status === "loading" && (
            <>
              <div className="mb-6 bg-[rgba(0,218,193,0.1)] p-5 rounded-full inline-flex items-center justify-center">
                <Loader2 size={64} className="text-[#00DAC1] animate-spin" />
              </div>
              <h2 className="text-[1.8rem] font-bold mb-2 text-white">
                {t("emailVerification.verifyLoadingTitle", "Verifying your email...")}
              </h2>
              <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem] mb-6">
                {t(
                  "emailVerification.verifyLoadingSubtitle",
                  "Please wait while we confirm your email address."
                )}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-6 bg-[rgba(0,218,193,0.1)] p-5 rounded-full inline-flex items-center justify-center">
                <CheckCircle2 size={64} className="text-[#00DAC1]" />
              </div>
              <h2 className="text-[2rem] font-bold mb-2 bg-[linear-gradient(135deg,#fff_0%,#00DAC1_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                {t("emailVerification.verifySuccessTitle", "Email verified successfully!")}
              </h2>
              <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem] mb-8 leading-relaxed">
                {t(
                  "emailVerification.verifySuccessSubtitle",
                  "Your email address has been verified. You can now log in to your account."
                )}
              </p>
              <Link
                to="/login"
                className="w-full bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold no-underline transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,218,193,0.4)]"
              >
                {t("emailVerification.goToLogin", "Proceed to Login")}
              </Link>
            </>
          )}

          {(status === "expired" || status === "missing") && (
            <>
              <div className="mb-6 bg-[rgba(255,77,77,0.1)] p-5 rounded-full inline-flex items-center justify-center">
                <AlertTriangle size={64} className="text-[#FF4D4D]" />
              </div>
              <h2 className="text-[1.8rem] font-bold mb-2 text-white">
                {status === "missing"
                  ? t("emailVerification.missingTokenTitle", "Missing verification link")
                  : t("emailVerification.verifyExpiredTitle", "Verification link invalid or expired")}
              </h2>
              <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem] mb-6 leading-relaxed">
                {errorMessage ||
                  (status === "missing"
                    ? t(
                        "emailVerification.missingTokenSubtitle",
                        "No verification token was found. Please check the link from your email."
                      )
                    : t(
                        "emailVerification.verifyExpiredSubtitle",
                        "This verification link is invalid or has expired. You can request a new one below."
                      ))}
              </p>

              {/* Resend Form */}
              <form onSubmit={handleResend} className="w-full mb-6 text-left">
                <label className="text-xs text-[rgba(255,255,255,0.6)] mb-1.5 block">
                  {t("emailVerification.emailLabel", "Email address")}
                </label>
                <div className="relative mb-2">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => {
                      setResendEmail(e.target.value);
                      if (emailInputError) setEmailInputError("");
                    }}
                    placeholder={t("emailVerification.emailPlaceholder", "Enter your account email")}
                    aria-label={t("emailVerification.emailLabel", "Email address")}
                    className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#00DAC1] ${
                      emailInputError ? "border-[#FF4D4D]" : "border-[rgba(255,255,255,0.1)]"
                    }`}
                  />
                </div>
                {emailInputError && (
                  <span className="text-[#FF4D4D] text-xs mb-2 block" role="alert">
                    {emailInputError}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isResending || cooldown > 0}
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
                className="w-full bg-transparent border border-[rgba(255,255,255,0.15)] text-white rounded-xl py-3.5 text-sm font-semibold no-underline transition-all flex items-center justify-center gap-2 hover:bg-[rgba(255,255,255,0.05)]"
              >
                <ArrowLeft size={18} /> {t("emailVerification.backToLogin", "Back to Login")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
