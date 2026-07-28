import React from 'react';
import { Check } from 'lucide-react';

export interface StepDef {
  label: string;
  description?: string;
}

export interface ProgressStepperProps {
  steps: StepDef[];
  currentStep: number; // 1-indexed
  className?: string;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  className = '',
}) => {
  return (
    <nav
      aria-label="Progress steps"
      className={`flex items-center justify-center ${className}`}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={stepNumber}>
            {/* Step node */}
            <div className="flex flex-col items-center gap-1.5">
              {/* Circle */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-[#00DAC1] text-black shadow-[0_0_0_4px_rgba(0,218,193,0.2)]'
                    : isCompleted
                    ? 'bg-[rgba(0,218,193,0.15)] border-2 border-[#00DAC1] text-[#00DAC1]'
                    : 'bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.35)]'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[0.7rem] font-medium text-center max-w-[72px] leading-tight transition-colors duration-300 ${
                  isActive
                    ? 'text-[#00DAC1]'
                    : isCompleted
                    ? 'text-[#00DAC1]/70'
                    : 'text-[rgba(255,255,255,0.3)]'
                }`}
              >
                {step.label}
              </span>

              {/* Description (optional, shown below label for active step) */}
              {isActive && step.description && (
                <span className="text-[0.65rem] text-[rgba(255,255,255,0.45)] text-center max-w-[80px] leading-tight">
                  {step.description}
                </span>
              )}
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={`h-px flex-1 mx-2 mb-5 transition-all duration-500 ${
                  isCompleted ? 'bg-[#00DAC1]' : 'bg-[rgba(255,255,255,0.1)]'
                }`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default ProgressStepper;
