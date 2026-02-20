import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      {/* Starfield dots */}
      <div className="hero__stars" aria-hidden="true">
        {Array.from({ length: 80 }).map((_, i) => (
          <span key={i} className="hero__star" />
        ))}
      </div>

      {/* Bottom city/building lines decoration */}
      <div className="hero__buildings" aria-hidden="true" />

      <div className="hero__container">
        <h1 className="hero__headline">
          TRANSPARENT <span className="hero__headline-accent">TRACKING</span>
        </h1>

        <p className="hero__subheadline">
          Our platform uses next gen tech to make your deliveries faster and more reliable.
          <br />
          Every step is visible, every shipment secure.
        </p>

        <div className="hero__cta-wrapper">
          {}
          <span className="hero__dash hero__dash--left" aria-hidden="true" />
          <a href="#track" className="hero__cta">
            Track Your Shipment
            <svg
              className="hero__cta-icon"
              width="22"
              height="16"
              viewBox="0 0 22 16"
              fill="none"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* truck icon */}
              <rect x="0" y="4" width="13" height="9" rx="1" stroke="currentColor" strokeWidth="1.4" />
              <path d="M13 6h4l3 4v3h-7V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="4" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="17" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </a>
          <span className="hero__dash hero__dash--right" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
