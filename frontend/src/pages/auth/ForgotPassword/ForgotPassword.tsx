import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const authCardClass = "min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden font-sans";
const cardInnerClass = "bg-[rgba(20,20,20,0.7)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-10 w-full max-w-[480px] z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] sm:p-8 sm:rounded-none sm:min-h-screen sm:flex sm:flex-col sm:justify-center";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState(false);

  const validateEmail = (val: string) => {
    if (!val) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(val)) return 'Invalid email format';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched) setError(validateEmail(val));
  };

  const handleBlur = () => { setTouched(true); setError(validateEmail(email)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  const inputBase = "w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 pr-12 text-white text-base transition-all box-border focus:outline-none focus:border-[#00DAC1] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_4px_rgba(0,218,193,0.1)]";

  const glowTop = (
    <div className="absolute w-[500px] h-[500px] top-[-250px] right-[-100px] z-0 pointer-events-none"
      style={{ background: 'radial-gradient(rgba(0,218,193,0.4), rgba(0,218,193,0))' }} />
  );
  const glowBottom = (
    <div className="absolute w-[600px] h-[600px] bottom-[-300px] left-[-200px] z-0 pointer-events-none"
      style={{ background: 'conic-gradient(from 180deg at 50% 50%, #16abff33 0deg, #0885ff33 55deg, #54d6ff33 120deg, #0071ff33 160deg, transparent 360deg)' }} />
  );

  if (submitted) {
    return (
      <div className={authCardClass}>
        {glowTop}{glowBottom}
        <div className={cardInnerClass}>
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 bg-[rgba(0,218,193,0.1)] p-5 rounded-full inline-flex items-center justify-center">
              <CheckCircle2 size={64} className="text-[#00DAC1]" />
            </div>
            <div className="text-center mb-8">
              <h2 className="text-[2rem] font-bold mb-2 bg-[linear-gradient(135deg,#fff_0%,#00DAC1_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                Check your email
              </h2>
              <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem]">If this email exists, you'll receive a reset link shortly.</p>
            </div>
            <Link
              to="/login"
              className="w-full mt-2 bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold no-underline transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,218,193,0.4)]"
            >
              <ArrowLeft size={20} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={authCardClass}>
      {glowTop}{glowBottom}
      <div className={cardInnerClass}>
        <div className="text-center mb-8">
          <h2 className="text-[2rem] font-bold mb-2 bg-[linear-gradient(135deg,#fff_0%,#00DAC1_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            Reset Password
          </h2>
          <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem]">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1">Email Address</label>
            <div className="relative">
              <input
                type="email" id="email" name="email" placeholder="name@company.com"
                value={email} onChange={handleChange} onBlur={handleBlur} autoComplete="email"
                className={`${inputBase} ${error ? 'border-[#FF4D4D]' : ''}`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.6)] flex items-center pointer-events-none">
                <Mail size={20} />
              </div>
            </div>
            {error && <span className="text-[#FF4D4D] text-[0.75rem] mt-1 ml-1">{error}</span>}
          </div>

          <button
            type="submit" disabled={loading}
            className="mt-3 bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_4px_15px_rgba(0,218,193,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-[rgba(0,0,0,0.1)] border-t-black rounded-full animate-spin" />
                Sending Link...
              </>
            ) : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-[0.9rem] text-[rgba(255,255,255,0.6)] mt-6">
          Remember your password?{" "}
          <Link to="/login" className="text-[#00DAC1] no-underline font-semibold hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
