import React from 'react';

interface FeatureBlockProps {
  index: number;
  headline: string;
  description: string;
  bullets: string[];
  imagePath: string;
  imageAlt: string;
  isVisible: boolean;
}

const FeatureBlock: React.FC<FeatureBlockProps> = ({
  index,
  headline,
  description,
  bullets,
  imagePath,
  imageAlt,
  isVisible,
}) => {
  const isImageLeft = index % 2 === 0;

  return (
    <div
      className={`feature-block ${isImageLeft ? 'feature-block--image-left' : 'feature-block--image-right'} ${
        isVisible ? 'feature-block--visible' : ''
      }`}
      data-index={index}
    >
      <div className="feature-block__image-wrapper">
        <img src={imagePath} alt={imageAlt} className="feature-block__image" loading="lazy" />
      </div>

      <div className="feature-block__content">
        <h3 className="feature-block__headline">{headline}</h3>
        <p className="feature-block__description">{description}</p>
        <ul className="feature-block__bullets">
          {bullets.map((bullet, i) => (
            <li key={i} className="feature-block__bullet">
              <svg
                className="feature-block__bullet-icon"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M6 10l3 3 5-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FeatureBlock;
