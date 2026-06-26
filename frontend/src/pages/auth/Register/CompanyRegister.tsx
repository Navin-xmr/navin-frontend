import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChevronLeft, Check, Pencil } from "lucide-react";
import { authApi } from "../../../services/api";

const INDUSTRIES = [
  "Agriculture",
  "Automotive",
  "Construction",
  "Education",
  "Energy & Utilities",
  "Finance & Banking",
  "Food & Beverage",
  "Healthcare",
  "Hospitality & Tourism",
  "Logistics & Supply Chain",
  "Manufacturing",
  "Media & Entertainment",
  "Mining & Resources",
  "Pharmaceuticals",
  "Real Estate",
  "Retail & E-commerce",
  "Technology & Software",
  "Telecommunications",
  "Transportation",
  "Other",
];

const COUNTRIES = [
  "Australia",
  "Brazil",
  "Canada",
  "China",
  "Egypt",
  "France",
  "Germany",
  "Ghana",
  "India",
  "Indonesia",
  "Japan",
  "Kenya",
  "Mexico",
  "Netherlands",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Other",
];

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1,000", "1,000+"];

interface Step1Data {
  companyName: string;
  industry: string;
  country: string;
  companySize: string;
}

interface Step2Data {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Step1Errors {
  companyName?: string;
  industry?: string;
  country?: string;
  companySize?: string;
}

interface Step2Errors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const inputBase =
  "w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white text-base transition-all box-border focus:outline-none focus:border-[#00DAC1] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_4px_rgba(0,218,193,0.1)]";

const selectBase =
  "w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white text-base transition-all box-border focus:outline-none focus:border-[#00DAC1] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_4px_rgba(0,218,193,0.1)] appearance-none cursor-pointer";

const labelClass = "text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1";
const errorClass = "text-[#FF4D4D] text-[0.75rem] mt-1 ml-1";

const STEP_LABELS = ["Company", "Admin", "Review"];
const STEP_TITLES = ["Company Info", "Admin Account", "Review & Submit"];
const STEP_DESCRIPTIONS = [
  "Tell us about your company",
  "Set up your admin credentials",
  "Confirm your details before submitting",
];

const CompanyRegister: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [step1, setStep1] = useState<Step1Data>({
    companyName: "",
    industry: "",
    country: "",
    companySize: "",
  });

  const [step2, setStep2] = useState<Step2Data>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"none" | "weak" | "fair" | "strong">("none");

  const calcPasswordStrength = (pass: string): "none" | "weak" | "fair" | "strong" => {
    if (!pass) return "none";
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    if (strength <= 1) return "weak";
    if (strength <= 3) return "fair";
    return "strong";
  };

  const validateStep1 = (): boolean => {
    const errs: Step1Errors = {};
    if (!step1.companyName.trim()) errs.companyName = "Company name is required";
    if (!step1.industry) errs.industry = "Please select an industry";
    if (!step1.country) errs.country = "Please select a country";
    if (!step1.companySize) errs.companySize = "Please select a company size";
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Step2Errors = {};
    if (!step2.fullName.trim()) errs.fullName = "Full name is required";
    if (!step2.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(step2.email)) errs.email = "Invalid email format";
    if (!step2.password) errs.password = "Password is required";
    else if (step2.password.length < 8) errs.password = "Minimum 8 characters required";
    if (step2.password !== step2.confirmPassword) errs.confirmPassword = "Passwords do not match";
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) setStep(2);
  };

  const handleNextStep2 = () => {
    if (validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setGeneralError("");
    try {
      await authApi.registerCompany({
        companyName: step1.companyName,
        industry: step1.industry,
        country: step1.country,
        companySize: step1.companySize,
        adminName: step2.fullName,
        email: step2.email,
        password: step2.password,
      });
      navigate("/register/verify-email", { state: { email: step2.email } });
    } catch {
      setGeneralError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strengthBarWidth = { none: "0%", weak: "33.33%", fair: "66.66%", strong: "100%" }[passwordStrength];
  const strengthBarColor = { none: "transparent", weak: "#FF4D4D", fair: "#FFAB00", strong: "#00E676" }[passwordStrength];
  const strengthLabel = {
    none: null,
    weak: <span className="text-[#FF4D4D] font-semibold">Weak</span>,
    fair: <span className="text-[#FFAB00] font-semibold">Fair</span>,
    strong: <span className="text-[#00E676] font-semibold">Strong</span>,
  }[passwordStrength];

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8" aria-label="Registration steps">
      {[1, 2, 3].map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s
                  ? "bg-[#00DAC1] text-black"
                  : step > s
                  ? "bg-[rgba(0,218,193,0.15)] border-2 border-[#00DAC1] text-[#00DAC1]"
                  : "bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.4)]"
              }`}
              aria-current={step === s ? "step" : undefined}
            >
              {step > s ? <Check size={16} /> : s}
            </div>
            <span
              className={`text-[0.7rem] font-medium ${
                step >= s ? "text-[#00DAC1]" : "text-[rgba(255,255,255,0.3)]"
              }`}
            >
              {STEP_LABELS[i]}
            </span>
          </div>
          {i < 2 && (
            <div
              className={`h-px flex-1 mx-2 mb-4 transition-all ${
                step > s ? "bg-[#00DAC1]" : "bg-[rgba(255,255,255,0.1)]"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {children}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[rgba(255,255,255,0.4)]">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="flex flex-col gap-5">
      {/* Company Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="companyName" className={labelClass}>Company Name</label>
        <input
          type="text"
          id="companyName"
          placeholder="Acme Corporation"
          value={step1.companyName}
          onChange={(e) => {
            setStep1((p) => ({ ...p, companyName: e.target.value }));
            if (step1Errors.companyName) setStep1Errors((p) => ({ ...p, companyName: undefined }));
          }}
          aria-invalid={!!step1Errors.companyName}
          aria-describedby={step1Errors.companyName ? "companyName-error" : undefined}
          className={`${inputBase} pr-4 ${step1Errors.companyName ? "border-[#FF4D4D]" : ""}`}
        />
        {step1Errors.companyName && (
          <span id="companyName-error" className={errorClass} role="alert">{step1Errors.companyName}</span>
        )}
      </div>

      {/* Industry */}
      <div className="flex flex-col gap-2">
        <label htmlFor="industry" className={labelClass}>Industry</label>
        <SelectWrapper>
          <select
            id="industry"
            value={step1.industry}
            onChange={(e) => {
              setStep1((p) => ({ ...p, industry: e.target.value }));
              if (step1Errors.industry) setStep1Errors((p) => ({ ...p, industry: undefined }));
            }}
            aria-invalid={!!step1Errors.industry}
            aria-describedby={step1Errors.industry ? "industry-error" : undefined}
            className={`${selectBase} ${step1Errors.industry ? "border-[#FF4D4D]" : ""} ${!step1.industry ? "text-[rgba(255,255,255,0.4)]" : ""}`}
          >
            <option value="" disabled className="bg-[#121620] text-[rgba(255,255,255,0.4)]">Select industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind} className="bg-[#121620] text-white">{ind}</option>
            ))}
          </select>
        </SelectWrapper>
        {step1Errors.industry && (
          <span id="industry-error" className={errorClass} role="alert">{step1Errors.industry}</span>
        )}
      </div>

      {/* Country */}
      <div className="flex flex-col gap-2">
        <label htmlFor="country" className={labelClass}>Country</label>
        <SelectWrapper>
          <select
            id="country"
            value={step1.country}
            onChange={(e) => {
              setStep1((p) => ({ ...p, country: e.target.value }));
              if (step1Errors.country) setStep1Errors((p) => ({ ...p, country: undefined }));
            }}
            aria-invalid={!!step1Errors.country}
            aria-describedby={step1Errors.country ? "country-error" : undefined}
            className={`${selectBase} ${step1Errors.country ? "border-[#FF4D4D]" : ""} ${!step1.country ? "text-[rgba(255,255,255,0.4)]" : ""}`}
          >
            <option value="" disabled className="bg-[#121620] text-[rgba(255,255,255,0.4)]">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c} className="bg-[#121620] text-white">{c}</option>
            ))}
          </select>
        </SelectWrapper>
        {step1Errors.country && (
          <span id="country-error" className={errorClass} role="alert">{step1Errors.country}</span>
        )}
      </div>

      {/* Company Size */}
      <div className="flex flex-col gap-2">
        <label htmlFor="companySize" className={labelClass}>Company Size</label>
        <SelectWrapper>
          <select
            id="companySize"
            value={step1.companySize}
            onChange={(e) => {
              setStep1((p) => ({ ...p, companySize: e.target.value }));
              if (step1Errors.companySize) setStep1Errors((p) => ({ ...p, companySize: undefined }));
            }}
            aria-invalid={!!step1Errors.companySize}
            aria-describedby={step1Errors.companySize ? "companySize-error" : undefined}
            className={`${selectBase} ${step1Errors.companySize ? "border-[#FF4D4D]" : ""} ${!step1.companySize ? "text-[rgba(255,255,255,0.4)]" : ""}`}
          >
            <option value="" disabled className="bg-[#121620] text-[rgba(255,255,255,0.4)]">Select company size</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s} className="bg-[#121620] text-white">{s} employees</option>
            ))}
          </select>
        </SelectWrapper>
        {step1Errors.companySize && (
          <span id="companySize-error" className={errorClass} role="alert">{step1Errors.companySize}</span>
        )}
      </div>

      <button
        type="button"
        onClick={handleNextStep1}
        className="mt-3 bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,218,193,0.4)]"
      >
        Continue
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col gap-5">
      {/* Full Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className={labelClass}>Full Name</label>
        <input
          type="text"
          id="fullName"
          placeholder="John Doe"
          value={step2.fullName}
          onChange={(e) => {
            setStep2((p) => ({ ...p, fullName: e.target.value }));
            if (step2Errors.fullName) setStep2Errors((p) => ({ ...p, fullName: undefined }));
          }}
          aria-invalid={!!step2Errors.fullName}
          aria-describedby={step2Errors.fullName ? "fullName-error" : undefined}
          className={`${inputBase} pr-4 ${step2Errors.fullName ? "border-[#FF4D4D]" : ""}`}
        />
        {step2Errors.fullName && (
          <span id="fullName-error" className={errorClass} role="alert">{step2Errors.fullName}</span>
        )}
      </div>

      {/* Business Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="bizEmail" className={labelClass}>Business Email</label>
        <input
          type="email"
          id="bizEmail"
          placeholder="you@company.com"
          value={step2.email}
          onChange={(e) => {
            setStep2((p) => ({ ...p, email: e.target.value }));
            if (step2Errors.email) setStep2Errors((p) => ({ ...p, email: undefined }));
          }}
          autoComplete="email"
          aria-invalid={!!step2Errors.email}
          aria-describedby={step2Errors.email ? "bizEmail-error" : undefined}
          className={`${inputBase} pr-4 ${step2Errors.email ? "border-[#FF4D4D]" : ""}`}
        />
        {step2Errors.email && (
          <span id="bizEmail-error" className={errorClass} role="alert">{step2Errors.email}</span>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass}>Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="••••••••"
            value={step2.password}
            onChange={(e) => {
              setStep2((p) => ({ ...p, password: e.target.value }));
              setPasswordStrength(calcPasswordStrength(e.target.value));
              if (step2Errors.password) setStep2Errors((p) => ({ ...p, password: undefined }));
            }}
            autoComplete="new-password"
            aria-invalid={!!step2Errors.password}
            aria-describedby={step2Errors.password ? "password-error" : undefined}
            className={`${inputBase} pr-12 ${step2Errors.password ? "border-[#FF4D4D]" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent text-[rgba(255,255,255,0.6)] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all hover:text-[#00DAC1] hover:bg-[rgba(255,255,255,0.05)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {step2.password && (
          <div className="mt-2">
            <div className="h-1 w-full bg-[rgba(255,255,255,0.1)] rounded-sm overflow-hidden mb-1.5">
              <div
                className="h-full transition-all duration-400"
                style={{ width: strengthBarWidth, backgroundColor: strengthBarColor }}
              />
            </div>
            <div className="text-[0.75rem] text-[rgba(255,255,255,0.6)]">
              Strength: {strengthLabel ?? "None"}
            </div>
          </div>
        )}
        {step2Errors.password && (
          <span id="password-error" className={errorClass} role="alert">{step2Errors.password}</span>
        )}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            placeholder="••••••••"
            value={step2.confirmPassword}
            onChange={(e) => {
              setStep2((p) => ({ ...p, confirmPassword: e.target.value }));
              if (step2Errors.confirmPassword) setStep2Errors((p) => ({ ...p, confirmPassword: undefined }));
            }}
            autoComplete="new-password"
            aria-invalid={!!step2Errors.confirmPassword}
            aria-describedby={step2Errors.confirmPassword ? "confirmPassword-error" : undefined}
            className={`${inputBase} pr-12 ${step2Errors.confirmPassword ? "border-[#FF4D4D]" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent text-[rgba(255,255,255,0.6)] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all hover:text-[#00DAC1] hover:bg-[rgba(255,255,255,0.05)]"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {step2Errors.confirmPassword && (
          <span id="confirmPassword-error" className={errorClass} role="alert">{step2Errors.confirmPassword}</span>
        )}
      </div>

      <div className="flex gap-3 mt-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-xl py-4 text-base font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-[rgba(255,255,255,0.1)]"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <button
          type="button"
          onClick={handleNextStep2}
          className="flex-[2] bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,218,193,0.4)]"
        >
          Review & Submit
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col gap-5">
      {generalError && (
        <div
          className="bg-[rgba(255,77,77,0.1)] border border-[#FF4D4D] rounded-xl px-4 py-3 text-[#FF4D4D] text-sm text-center"
          role="alert"
        >
          {generalError}
        </div>
      )}

      {/* Company Info Summary */}
      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[0.75rem] font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
            Company Information
          </span>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-[0.8rem] text-[#00DAC1] font-medium bg-transparent border-none cursor-pointer hover:underline"
          >
            <Pencil size={13} /> Edit
          </button>
        </div>
        <dl className="flex flex-col gap-2.5">
          {(
            [
              ["Company Name", step1.companyName],
              ["Industry", step1.industry],
              ["Country", step1.country],
              ["Company Size", step1.companySize ? `${step1.companySize} employees` : ""],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between text-[0.9rem]">
              <dt className="text-[rgba(255,255,255,0.5)]">{label}</dt>
              <dd className="text-white font-medium text-right max-w-[55%]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Admin Account Summary */}
      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[0.75rem] font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
            Admin Account
          </span>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center gap-1 text-[0.8rem] text-[#00DAC1] font-medium bg-transparent border-none cursor-pointer hover:underline"
          >
            <Pencil size={13} /> Edit
          </button>
        </div>
        <dl className="flex flex-col gap-2.5">
          {(
            [
              ["Full Name", step2.fullName],
              ["Email", step2.email],
              ["Password", "••••••••"],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between text-[0.9rem]">
              <dt className="text-[rgba(255,255,255,0.5)]">{label}</dt>
              <dd className="text-white font-medium text-right max-w-[55%] break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex gap-3 mt-3">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-xl py-4 text-base font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-[rgba(255,255,255,0.1)]"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-[2] bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_4px_15px_rgba(0,218,193,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-[rgba(0,0,0,0.1)] border-t-black rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            "Create Company Account"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden font-sans py-12">
      <div
        className="absolute w-[500px] h-[500px] top-[-250px] right-[-100px] z-0 pointer-events-none"
        style={{ background: "radial-gradient(rgba(0,218,193,0.4), rgba(0,218,193,0))" }}
      />
      <div
        className="absolute w-[600px] h-[600px] bottom-[-300px] left-[-200px] z-0 pointer-events-none"
        style={{ background: "conic-gradient(from 180deg at 50% 50%, #16abff33 0deg, #0885ff33 55deg, #54d6ff33 120deg, #0071ff33 160deg, transparent 360deg)" }}
      />

      <div className="bg-[rgba(20,20,20,0.7)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-10 w-full max-w-[480px] z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] sm:p-8 sm:rounded-none sm:min-h-screen sm:flex sm:flex-col sm:justify-center">
        <div className="text-center mb-8">
          <h2 className="text-[2rem] font-bold mb-2 bg-[linear-gradient(135deg,#fff_0%,#00DAC1_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            {STEP_TITLES[step - 1]}
          </h2>
          <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem]">
            {STEP_DESCRIPTIONS[step - 1]}
          </p>
        </div>

        <StepIndicator />

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <p className="text-center text-[0.9rem] text-[rgba(255,255,255,0.6)] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#00DAC1] no-underline font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CompanyRegister;
