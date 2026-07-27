import React from 'react';

interface AnimatedPageProps {
  children: React.ReactNode;
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({ children }) => {
  return (
    <div
      className="animate-fade-in-up"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </div>
  );
};

export default AnimatedPage;
