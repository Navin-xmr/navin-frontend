import React from 'react';
import Hero from './sections/Hero/Hero';
import CoreFeatures from './sections/CoreFeatures/CoreFeatures';

const LandingPage: React.FC = () => {
  return (
    <main>
      <Hero />
      <CoreFeatures />
    </main>
  );
};

export default LandingPage;
