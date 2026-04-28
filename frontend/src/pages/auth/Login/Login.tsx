import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

interface FormErrors {
    email?: string;
    password?: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    const validateField = (name: string, value: string) => {
        if (name === "email") {
            if (!value) return "Email is required";
            if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format";
        } else if (name === "password") {
            if (!value) return "Password is required";
        }
        return "";
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (touched[name])
            setErrors((prev) => ({
                ...prev,
                [name]: validateField(name, value),
            }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailError = validateField("email", formData.email);
        const passwordError = validateField("password", formData.password);
        setErrors({ email: emailError, password: passwordError });
        setTouched({ email: true, password: true });
        if (emailError || passwordError) return;

        setLoading(true);
        setTimeout(() => {
            localStorage.setItem("authToken", "navin-demo-token");
            const from = location.state?.from?.pathname ?? "/dashboard";
            setLoading(false);
            navigate(from, { replace: true });
        }, 2000);
    };

    const inputBase =
        "w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 pr-12 text-white text-base transition-all box-border focus:outline-none focus:border-[#00DAC1] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_4px_rgba(0,218,193,0.1)]";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden font-sans">
            <div
                className="absolute w-125 h-125 -top-62.5 -right-25 z-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(rgba(0,218,193,0.4), rgba(0,218,193,0))",
                }}
            />
            <div
                className="absolute w-150 h-150 -bottom-75 -left-50 z-0 pointer-events-none"
                style={{
                    background:
                        "conic-gradient(from 180deg at 50% 50%, #16abff33 0deg, #0885ff33 55deg, #54d6ff33 120deg, #0071ff33 160deg, transparent 360deg)",
                }}
            />

            <div className="bg-[rgba(20,20,20,0.7)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-10 w-full max-w-120 z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] sm:p-8 sm:rounded-none sm:min-h-screen sm:flex sm:flex-col sm:justify-center">
                <div className="text-center mb-8">
                    <h2 className="text-[2rem] font-bold mb-2 bg-[linear-gradient(135deg,#fff_0%,#00DAC1_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                        Welcome Back
                    </h2>
                    <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem]">
                        Enter your details to access your account
                    </p>
                </div>

                <form
                    className="flex flex-col gap-5"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="email"
                            className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            autoComplete="email"
                            className={`${inputBase} ${errors.email ? "border-[#FF4D4D]" : ""}`}
                        />
                        {errors.email && (
                            <span className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="password"
                            className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autoComplete="current-password"
                                className={`${inputBase} ${errors.password ? "border-[#FF4D4D]" : ""}`}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-[rgba(255,255,255,0.6)] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all hover:text-[#00DAC1] hover:bg-[rgba(255,255,255,0.05)]"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1">
                                {errors.password}
                            </span>
                        )}
                        <Link
                            to="/forgot-password"
                            className="self-end text-[0.8rem] text-[#00DAC1] no-underline -mt-1 transition-all hover:underline hover:opacity-80"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-3 bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_4px_15px_rgba(0,218,193,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-[rgba(0,0,0,0.1)] border-t-black rounded-full animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            "Log In"
                        )}
                    </button>
                </form>

                <p className="text-center text-[0.9rem] text-[rgba(255,255,255,0.6)] mt-6">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-[#00DAC1] no-underline font-semibold hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
