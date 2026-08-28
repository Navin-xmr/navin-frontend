import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const NotFoundPage: React.FC = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505] text-white font-sans px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0,218,193,0.18) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <img src="/images/logo.svg" alt="Navin Logo" className="w-14 h-14 object-contain mb-8" />

        <h1 className="text-[clamp(4rem,12vw,7rem)] font-bold leading-none bg-[linear-gradient(135deg,#fff_0%,#00DAC1_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold mt-4 mb-3">
          Page Not Found
        </h2>

        <p className="text-[rgba(255,255,255,0.6)] text-sm md:text-base mb-10">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          className="px-8 py-4 rounded-xl font-bold bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black hover:opacity-90 transition-opacity duration-200"
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
