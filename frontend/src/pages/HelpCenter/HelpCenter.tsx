import React from 'react';
import { resetTourFlag } from '@components/onboarding/OnboardingTour';
import { HelpCircle, RotateCcw } from 'lucide-react';

const HelpCenter: React.FC = () => {
  const handleRestartTour = () => {
    resetTourFlag();
    // Reload the page so the tour can start fresh
    window.location.reload();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <HelpCircle size={28} className="text-[#62ffff]" />
        <h1 className="text-2xl font-bold text-white m-0">Help Center</h1>
      </div>

      <section className="bg-[#14171e] border border-[#1e293b] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">
          Onboarding Tour
        </h2>
        <p className="text-sm text-[#94a3b8] mb-4 leading-relaxed">
          If you would like to revisit the guided introduction to Navin, you can
          restart the onboarding tour below. The tour will walk you through the
          key features of the platform step by step.
        </p>
        <button
          onClick={handleRestartTour}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all border-none
            bg-gradient-to-br from-[#13baba] to-[#0d9488] text-white
            hover:from-[#0d9488] hover:to-[#0b7d7a]"
        >
          <RotateCcw size={16} />
          Restart Tour
        </button>
      </section>

      <section className="bg-[#14171e] border border-[#1e293b] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Contact Support</h2>
        <p className="text-sm text-[#94a3b8] leading-relaxed">
          Need further assistance? Reach out to our team at{' '}
          <a href="mailto:support@navin.io" className="text-[#62ffff] underline">
            support@navin.io
          </a>
        </p>
      </section>
    </div>
  );
};

export default HelpCenter;
