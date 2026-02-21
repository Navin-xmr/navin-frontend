import React, { useEffect, useRef, useState } from 'react';

interface FeatureBlockProps {
  headline: string;
  description: string;
  bulletPoints: string[];
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

const FeatureBlock: React.FC<FeatureBlockProps> = ({
  headline,
  description,
  bulletPoints,
  imageSrc,
  imageAlt,
  reverse = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (blockRef.current) {
      observer.observe(blockRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={blockRef}
      className={`feature-block ${reverse ? 'feature-block--reverse' : ''} ${
        isVisible ? 'feature-block--visible' : ''
      }`}
    >
      <div className="feature-block__image-wrapper">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="feature-block__image"
          loading="lazy"
        />
      </div>

      <div className="feature-block__content">
        <h3 className="feature-block__headline">{headline}</h3>
        <p className="feature-block__description">{description}</p>
        <ul className="feature-block__bullets">
          {bulletPoints.map((point, index) => (
            <li key={index} className="feature-block__bullet">
              <svg
                className="feature-block__bullet-icon"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="10" cy="10" r="9" stroke="#00d4c8" strokeWidth="1.5" />
                <path
                  d="M6 10 L9 13 L14 7"
                  stroke="#00d4c8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FeatureBlock;
