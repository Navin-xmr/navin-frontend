import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { WalletConnectButton } from "../../../components/auth/WalletConnectButton/WalletConnectButton";
import { authApi } from "../../../services/api";
import PasswordStrengthMeter from "../../../components/ui/PasswordStrengthMeter";

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

const Signup: React.FC = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = t("signup.errorFullNameRequired");
    if (!formData.email) newErrors.email = t("signup.errorEmailRequired");
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t("signup.errorEmailInvalid");
    if (!formData.password) newErrors.password = t("signup.errorPasswordRequired");
    else if (formData.password.length < 8) newErrors.password = t("signup.errorPasswordMinLength");
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t("signup.errorPasswordsMismatch");
    if (!formData.terms) newErrors.terms = t("signup.errorTermsRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.signup({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
      });
      navigate("/dashboard");
    } catch {
      setErrors((prev) => ({ ...prev, general: t("signup.errorGeneral") }));
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 pr-12 text-white text-base transition-all box-border focus:outline-none focus:border-[#00DAC1] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_4px_rgba(0,218,193,0.1)]";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden font-sans">
      {/* Background glows */}
      <div className="absolute w-[500px] h-[500px] top-[-250px] right-[-100px] z-0 pointer-events-none"
        style={{ background: 'radial-gradient(rgba(0,218,193,0.4), rgba(0,218,193,0))' }} />
      <div className="absolute w-[600px] h-[600px] bottom-[-300px] left-[-200px] z-0 pointer-events-none"
        style={{ background: 'conic-gradient(from 180deg at 50% 50%, #16abff33 0deg, #0885ff33 55deg, #54d6ff33 120deg, #0071ff33 160deg, transparent 360deg)' }} />

      <div className="bg-[rgba(20,20,20,0.7)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-10 w-full max-w-[480px] z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] sm:p-8 sm:rounded-none sm:min-h-screen sm:flex sm:flex-col sm:justify-center">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-[2rem] font-bold mb-2 bg-[linear-gradient(135deg,#fff_0%,#00DAC1_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            {t("signup.title")}
          </h2>
          <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem]">{t("signup.subtitle")}</p>
        </div>

        <div className="flex justify-center mb-5">
          <WalletConnectButton />
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-[rgba(255,77,77,0.1)] border border-[#FF4D4D] rounded-xl px-4 py-3 text-[#FF4D4D] text-sm text-center" role="alert">
              {errors.general}
            </div>
          )}
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1">{t("signup.fullNameLabel")}</label>
            <input
              type="text" id="fullName" name="fullName" placeholder={t("signup.fullNamePlaceholder")}
              value={formData.fullName} onChange={handleChange}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              className={`${inputBase} ${errors.fullName ? 'border-[#FF4D4D]' : ''}`}
            />
            {errors.fullName && <span id="fullName-error" className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1" role="alert">{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1">{t("signup.emailLabel")}</label>
            <input
              type="email" id="email" name="email" placeholder={t("signup.emailPlaceholder")}
              value={formData.email} onChange={handleChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`${inputBase} ${errors.email ? 'border-[#FF4D4D]' : ''}`}
            />
            {errors.email && <span id="email-error" className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1" role="alert">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1">{t("signup.passwordLabel")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} id="password" name="password" placeholder="••••••••"
                value={formData.password} onChange={handleChange}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={`${inputBase} ${errors.password ? 'border-[#FF4D4D]' : ''}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-[rgba(255,255,255,0.6)] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all hover:text-[#00DAC1] hover:bg-[rgba(255,255,255,0.05)]"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t("signup.hidePassword") : t("signup.showPassword")}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && (
              <PasswordStrengthMeter password={formData.password} />
            )}
            {errors.password && <span id="password-error" className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1" role="alert">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1">{t("signup.confirmPasswordLabel")}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" placeholder="••••••••"
                value={formData.confirmPassword} onChange={handleChange}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                className={`${inputBase} ${errors.confirmPassword ? 'border-[#FF4D4D]' : ''}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-[rgba(255,255,255,0.6)] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all hover:text-[#00DAC1] hover:bg-[rgba(255,255,255,0.05)]"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? t("signup.hidePassword") : t("signup.showPassword")}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <span id="confirmPassword-error" className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1" role="alert">{errors.confirmPassword}</span>}
          </div>

          {/* Terms Checkbox */}
          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 cursor-pointer text-[0.85rem] text-[rgba(255,255,255,0.6)] select-none">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox" id="terms" name="terms" checked={formData.terms} onChange={handleChange}
                  aria-invalid={!!errors.terms}
                  aria-describedby={errors.terms ? "terms-error" : undefined}
                  className="sr-only peer"
                />
                <div className="w-[18px] h-[18px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] rounded peer-checked:bg-[#00DAC1] peer-checked:border-[#00DAC1] transition-all" />
                <svg
                  className="absolute top-0.5 left-0.5 w-3.5 h-3.5 text-white hidden peer-checked:block pointer-events-none"
                  viewBox="0 0 14 14" fill="none"
                >
                  <path d="M2 7l4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span>
                {t("signup.termsLabel")}{" "}
                <a href="#" className="text-[#00DAC1] no-underline hover:underline">{t("signup.termsLink")}</a>
              </span>
            </label>
            {errors.terms && <span id="terms-error" className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1" role="alert">{errors.terms}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_4px_15px_rgba(0,218,193,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-[rgba(0,0,0,0.1)] border-t-black rounded-full animate-spin" />
                {t("signup.submitting")}
              </>
            ) : t("signup.submit")}
          </button>
        </form>

        <p className="text-center text-[0.9rem] text-[rgba(255,255,255,0.6)] mt-6">
          {t("signup.alreadyHaveAccount")}{" "}
          <Link to="/login" className="text-[#00DAC1] no-underline font-semibold hover:underline">{t("signup.signIn")}</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
