import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { WalletConnectButton } from "../../../components/auth/WalletConnectButton/WalletConnectButton";

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"none" | "weak" | "fair" | "strong">("none");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const calculatePasswordStrength = (pass: string): "none" | "weak" | "fair" | "strong" => {
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

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Minimum 8 characters required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.terms) newErrors.terms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (name === "password") setPasswordStrength(calculatePasswordStrength(value));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); alert("Account created successfully (simulation)"); }, 2000);
  };

  const strengthBarWidth = { none: "0%", weak: "33.33%", fair: "66.66%", strong: "100%" }[passwordStrength];
  const strengthBarColor = { none: "transparent", weak: "#FF4D4D", fair: "#FFAB00", strong: "#00E676" }[passwordStrength];
  const strengthLabel = { none: null, weak: <span className="text-[#FF4D4D] font-semibold">Weak</span>, fair: <span className="text-[#FFAB00] font-semibold">Fair</span>, strong: <span className="text-[#00E676] font-semibold">Strong</span> }[passwordStrength];

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
            Create Account
          </h2>
          <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem]">Join Navin and experience transparent tracking</p>
        </div>

        <div className="flex justify-center mb-5">
          <WalletConnectButton />
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1">Full Name</label>
            <input
              type="text" id="fullName" name="fullName" placeholder="John Doe"
              value={formData.fullName} onChange={handleChange}
              className={`${inputBase} ${errors.fullName ? 'border-[#FF4D4D]' : ''}`}
            />
            {errors.fullName && <span className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1">{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1">Email Address</label>
            <input
              type="email" id="email" name="email" placeholder="name@company.com"
              value={formData.email} onChange={handleChange}
              className={`${inputBase} ${errors.email ? 'border-[#FF4D4D]' : ''}`}
            />
            {errors.email && <span className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} id="password" name="password" placeholder="••••••••"
                value={formData.password} onChange={handleChange}
                className={`${inputBase} ${errors.password ? 'border-[#FF4D4D]' : ''}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-[rgba(255,255,255,0.6)] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all hover:text-[#00DAC1] hover:bg-[rgba(255,255,255,0.05)]"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="h-1 w-full bg-[rgba(255,255,255,0.1)] rounded-sm overflow-hidden mb-1.5">
                  <div className="h-full transition-all duration-400" style={{ width: strengthBarWidth, backgroundColor: strengthBarColor }} />
                </div>
                <div className="text-[0.75rem] text-[rgba(255,255,255,0.6)]">Strength: {strengthLabel ?? "None"}</div>
              </div>
            )}
            {errors.password && <span className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" placeholder="••••••••"
                value={formData.confirmPassword} onChange={handleChange}
                className={`${inputBase} ${errors.confirmPassword ? 'border-[#FF4D4D]' : ''}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-[rgba(255,255,255,0.6)] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all hover:text-[#00DAC1] hover:bg-[rgba(255,255,255,0.05)]"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1">{errors.confirmPassword}</span>}
          </div>

          {/* Terms Checkbox */}
          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 cursor-pointer text-[0.85rem] text-[rgba(255,255,255,0.6)] select-none">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox" name="terms" checked={formData.terms} onChange={handleChange}
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
                I agree to the{" "}
                <a href="#" className="text-[#00DAC1] no-underline hover:underline">Terms and Conditions</a>
              </span>
            </label>
            {errors.terms && <span className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1">{errors.terms}</span>}
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
                Creating Account...
              </>
            ) : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[0.9rem] text-[rgba(255,255,255,0.6)] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#00DAC1] no-underline font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
