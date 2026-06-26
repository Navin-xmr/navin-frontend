import React from 'react';

const LOGOS = [
  { name: 'Stellar', color: '#00D4C8' },
  { name: 'Soroban', color: '#9B5CF7' },
  { name: 'Shipbob', color: '#00B4D8' },
  { name: 'FedEx', color: '#FF7439' },
  { name: 'DHL', color: '#FFC600' },
  { name: 'Maersk', color: '#4BA8E8' },
  { name: 'Flexport', color: '#00AEEF' },
];

// Duplicated for seamless infinite loop
const STRIP = [...LOGOS, ...LOGOS];

const LogoStrip: React.FC = () => (
  <div className="w-full py-10 overflow-hidden border-y border-[rgba(0,180,160,0.12)] bg-[rgba(0,8,12,0.4)]">
    <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-6">
      Powered by &amp; Trusted with
    </p>

    <div
      className="relative flex w-max gap-10 logo-strip-track"
      onMouseEnter={(e) =>
        (e.currentTarget.style.animationPlayState = 'paused')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.animationPlayState = 'running')
      }
    >
      {STRIP.map((logo, i) => (
        <div
          key={i}
          className="flex items-center justify-center px-6 min-w-[140px] h-14 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] select-none shrink-0"
        >
          <span
            className="text-lg font-bold tracking-tight"
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
);

export default LogoStrip;
