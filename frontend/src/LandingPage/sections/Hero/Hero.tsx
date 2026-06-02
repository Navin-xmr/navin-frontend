import React from 'react';

const Hero: React.FC = () => {
  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #0a3d3a 0%, #061e20 35%, #020d10 70%, #000 100%)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Starfield dots */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        {Array.from({ length: 80 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-[rgba(180,230,255,0.6)] animate-twinkle"
            style={{
              top: `${5 + (i * 7) % 75}%`,
              left: `${3 + (i * 11) % 94}%`,
              animationDuration: `${2.2 + (i % 5) * 0.3}s`,
              animationDelay: `${(i % 11) * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom building silhouette decoration */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[160px] pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background: 'repeating-linear-gradient(to right, transparent 0px, transparent 18px, rgba(0,180,160,0.15) 18px, rgba(0,180,160,0.15) 20px)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-6 px-6 max-w-[900px] w-full">
        <h1
          className="font-normal tracking-[0.04em] leading-none text-white"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(3rem, 9vw, 7rem)',
          }}
        >
          TRANSPARENT <span className="text-[#00d4c8]">TRACKING</span>
        </h1>

        <p
          className="font-light leading-[1.7] text-[rgba(200,230,240,0.75)] max-w-[580px]"
          style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)' }}
        >
          Our platform uses next gen tech to make your deliveries faster and more reliable.
          <br className="hidden sm:hidden" />
          Every step is visible, every shipment secure.
        </p>

        <div className="flex items-center gap-0 mt-2 w-full justify-center">
          {/* Dashed line left */}
          <span
            className="flex-1 max-w-[200px] sm:max-w-[60px] h-px border-t-[1.5px] border-dashed border-[rgba(0,180,160,0.5)]"
            aria-hidden="true"
          />

          <a
            href="#track"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 sm:px-6 sm:py-3 bg-[rgba(8,40,50,0.75)] text-white text-base sm:text-[0.9rem] font-medium no-underline border-[1.5px] border-[rgba(0,180,160,0.6)] rounded-full cursor-pointer backdrop-blur-[8px] whitespace-nowrap transition-all duration-[250ms] hover:bg-[rgba(0,120,110,0.35)] hover:border-[#00d4c8] hover:shadow-[0_0_24px_rgba(0,212,200,0.3),inset_0_0_12px_rgba(0,212,200,0.08)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#00d4c8] focus-visible:outline-offset-4"
          >
            Track Your Shipment
            <svg
              className="shrink-0 text-[#00d4c8]"
              width="22"
              height="16"
              viewBox="0 0 22 16"
              fill="none"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0" y="4" width="13" height="9" rx="1" stroke="currentColor" strokeWidth="1.4" />
              <path d="M13 6h4l3 4v3h-7V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="4" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="17" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </a>

          {/* Dashed line right */}
          <span
            className="flex-1 max-w-[200px] sm:max-w-[60px] h-px border-t-[1.5px] border-dashed border-[rgba(0,180,160,0.5)]"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
