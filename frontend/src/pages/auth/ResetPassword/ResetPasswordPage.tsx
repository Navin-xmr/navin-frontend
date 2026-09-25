import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { AxiosError } from "axios";
import { useToast } from "../../../context/ToastContext";
import { authApi } from "../../../services/api";
import PasswordStrengthMeter from "../../../components/ui/PasswordStrengthMeter";
import { validatePassword } from "../../../utils/passwordPolicy";

const authCardClass = "min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden font-sans";
const cardInnerClass =
  "bg-[rgba(20,20,20,0.7)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-10 w-full max-w-[480px] z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] sm:p-8 sm:rounded-none sm:min-h-screen sm:flex sm:flex-col sm:justify-center";

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation("auth");
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [token, setToken] = useState<string>(() => {
    return (location.state as { token?: string } | null)?.token || searchParams.get("token") || "";
  });

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      navigate(location.pathname, { replace: true, state: { token: urlToken } });
    }
  }, [searchParams, location.pathname, navigate]);

  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "", general: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const nextErrors = { newPassword: "", confirmPassword: "", general: "" };
    const validation = validatePassword(formData.newPassword);

    if (!formData.newPassword) {
      nextErrors.newPassword = t("resetPassword.errorNewPasswordRequired");
    } else if (!validation.meetsMinLength) {
      nextErrors.newPassword = t("resetPassword.errorPasswordMinLength");
    } else if (!validation.hasUppercase || !validation.hasLowercase || !validation.hasNumber || !validation.hasSpecial) {
      nextErrors.newPassword = t("resetPassword.errorPasswordComplexity");
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = t("resetPassword.errorConfirmPasswordRequired");
    } else if (formData.confirmPassword !== formData.newPassword) {
      nextErrors.confirmPassword = t("resetPassword.errorPasswordsMismatch");
    }

    if (!token) {
      nextErrors.general = t("resetPassword.errorMissingToken");
    }

    setErrors(nextErrors);
    return !nextErrors.newPassword && !nextErrors.confirmPassword && !nextErrors.general;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: formData.newPassword });
      addToast(t("resetPassword.toastSuccess"), "success");
      navigate("/login", { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const serverMessage = axiosError?.response?.data?.message;
      const fallbackMessage = axiosError?.response?.status === 401 || axiosError?.response?.status === 400
        ? t("resetPassword.errorInvalidToken")
        : t("resetPassword.errorGeneral");
      setErrors({ newPassword: "", confirmPassword: "", general: serverMessage || fallbackMessage });
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 pr-12 text-white text-base transition-all box-border focus:outline-none focus:border-[#00DAC1] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_4px_rgba(0,218,193,0.1)]";

  const glowTop = (
    <div
      className="absolute w-[500px] h-[500px] top-[-250px] right-[-100px] z-0 pointer-events-none"
      style={{ background: "radial-gradient(rgba(0,218,193,0.4), rgba(0,218,193,0))" }}
    />
  );

  const glowBottom = (
    <div
      className="absolute w-[600px] h-[600px] bottom-[-300px] left-[-200px] z-0 pointer-events-none"
      style={{ background: "conic-gradient(from 180deg at 50% 50%, #16abff33 0deg, #0885ff33 55deg, #54d6ff33 120deg, #0071ff33 160deg, transparent 360deg)" }}
    />
  );

  return (
    <div className={authCardClass}>
      {glowTop}
      {glowBottom}
      <div className={cardInnerClass}>
        <div className="text-center mb-8">
          <h2 className="text-[2rem] font-bold mb-2 bg-[linear-gradient(135deg,#fff_0%,#00DAC1_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            {t("resetPassword.title")}
          </h2>
          <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem]">
            {t("resetPassword.subtitle")}
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className="bg-[rgba(255,77,77,0.1)] border border-[#FF4D4D] rounded-xl px-4 py-3 text-[#FF4D4D] text-sm text-center" role="alert">
              {errors.general}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1">
              {t("resetPassword.newPasswordLabel")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                aria-invalid={!!errors.newPassword}
                aria-describedby={errors.newPassword ? "new-password-error" : undefined}
                className={`${inputBase} ${errors.newPassword ? "border-[#FF4D4D]" : ""}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-[rgba(255,255,255,0.6)] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all hover:text-[#00DAC1] hover:bg-[rgba(255,255,255,0.05)]"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t("resetPassword.hidePassword") : t("resetPassword.showPassword")}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.newPassword && (
              <span id="new-password-error" className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1" role="alert">
                {errors.newPassword}
              </span>
            )}
            {formData.newPassword && (
              <PasswordStrengthMeter password={formData.newPassword} />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1">
              {t("resetPassword.confirmPasswordLabel")}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                className={`${inputBase} ${errors.confirmPassword ? "border-[#FF4D4D]" : ""}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-[rgba(255,255,255,0.6)] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all hover:text-[#00DAC1] hover:bg-[rgba(255,255,255,0.05)]"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? t("resetPassword.hidePassword") : t("resetPassword.showPassword")}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span id="confirm-password-error" className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="mt-3 bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_4px_15px_rgba(0,218,193,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-[rgba(0,0,0,0.1)] border-t-black rounded-full animate-spin" />
                {t("resetPassword.submitting")}
              </>
            ) : (
              t("resetPassword.submit")
            )}
          </button>
        </form>

        <p className="text-center text-[0.9rem] text-[rgba(255,255,255,0.6)] mt-6">
          {t("resetPassword.rememberPassword")}{" "}
          <Link to="/login" className="text-[#00DAC1] no-underline font-semibold hover:underline">
            {t("resetPassword.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
