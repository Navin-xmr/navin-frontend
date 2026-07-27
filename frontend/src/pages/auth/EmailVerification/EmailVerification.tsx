import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Mail } from "lucide-react";

const EmailVerification: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email as string | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden font-sans">
      <div
        className="absolute w-[500px] h-[500px] top-[-250px] right-[-100px] z-0 pointer-events-none"
        style={{ background: "radial-gradient(rgba(0,218,193,0.4), rgba(0,218,193,0))" }}
      />
      <div
        className="absolute w-[600px] h-[600px] bottom-[-300px] left-[-200px] z-0 pointer-events-none"
        style={{ background: "conic-gradient(from 180deg at 50% 50%, #16abff33 0deg, #0885ff33 55deg, #54d6ff33 120deg, #0071ff33 160deg, transparent 360deg)" }}
      />

      <div className="bg-[rgba(20,20,20,0.7)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-10 w-full max-w-[480px] z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] sm:p-8 sm:rounded-none sm:min-h-screen sm:flex sm:flex-col sm:justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 bg-[rgba(0,218,193,0.1)] p-5 rounded-full inline-flex items-center justify-center">
            <CheckCircle2 size={64} className="text-[#00DAC1]" />
          </div>

          <h2 className="text-[2rem] font-bold mb-2 bg-[linear-gradient(135deg,#fff_0%,#00DAC1_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            Check your email
          </h2>

          <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem] mb-2">
            We sent a verification link to
          </p>

          {email && (
            <p className="text-white font-semibold text-[0.95rem] mb-4 flex items-center gap-2">
              <Mail size={16} className="text-[#00DAC1]" />
              {email}
            </p>
          )}

          <p className="text-[rgba(255,255,255,0.5)] text-[0.875rem] mb-8 leading-relaxed">
            Click the link in your inbox to verify your email address and activate your company account. The link expires in 24 hours.
          </p>

          <Link
            to="/login"
            className="w-full bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold no-underline transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,218,193,0.4)]"
          >
            <ArrowLeft size={20} /> Back to Login
          </Link>

          <p className="text-[rgba(255,255,255,0.4)] text-[0.8rem] mt-6">
            Didn't receive it?{" "}
            <Link
              to="/register/company"
              className="text-[#00DAC1] no-underline font-semibold hover:underline"
            >
              Try again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
