import React from 'react';

const LOGOS = [
  { name: 'Stellar',  color: '#00D4C8' },
  { name: 'Soroban',  color: '#9B5CF7' },
  { name: 'Shipbob',  color: '#00B4D8' },
  { name: 'FedEx',    color: '#FF7439' },
  { name: 'DHL',      color: '#FFC600' },
  { name: 'Maersk',   color: '#4BA8E8' },
  { name: 'Flexport', color: '#00AEEF' },
];

const STRIP = [...LOGOS, ...LOGOS];

const LogoStrip: React.FC = () => (
  <section
    aria-label="Technology and Partners"
    className="w-full py-10 overflow-hidden border-y border-border-light bg-background-secondary"
  >
    <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary mb-6">
      Powered by &amp; Trusted with
    </p>

    <div className="logo-strip-wrapper">
      <div className="logo-strip-track">
        {STRIP.map((logo, i) => (
          <div
            key={i}
            className="group flex items-center justify-center px-6 min-w-[140px] h-14 rounded-xl border border-border-light bg-background-card/40 backdrop-blur-sm select-none shrink-0 transition-all duration-300 hover:border-primary-light hover:bg-background-card/60 hover:shadow-glow-blue hover:scale-105"
          >
            <span
              className="text-lg font-bold tracking-tight transition-all duration-300 group-hover:scale-110"
              style={{
                color: logo.color,
                fontFamily: "'Bricolage Grotesque', sans-serif",
                textShadow: `0 0 18px ${logo.color}55`,
              }}
            >
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LogoStrip;