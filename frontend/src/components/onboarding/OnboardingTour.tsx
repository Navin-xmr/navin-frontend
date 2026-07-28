/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TourStep {
  /** Unique id for the element to highlight (data-tour-id) */
  targetId: string;
  /** Heading displayed in the popover */
  heading: string;
  /** Body text (1-2 sentences) */
  body: string;
  /** Optional placement override; defaults to 'bottom' */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface OnboardingTourProps {
  /** Ordered list of tour steps */
  steps: TourStep[];
  /** Called when the tour is completed or skipped */
  onClose?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'navin_tour_complete';

/** Check whether the tour has already been completed */
export function isTourComplete(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Mark the tour as complete so it won't show again */
export function markTourComplete(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // localStorage unavailable – silently ignore
  }
}

/** Reset the tour flag (used by "Restart Tour" button) */
export function resetTourFlag(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Spotlight overlay component
// ---------------------------------------------------------------------------

interface SpotlightOverlayProps {
  /** Bounding rect of the highlighted element */
  rect: DOMRect | null;
}

const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({ rect }) => {
  if (!rect) return null;

  // The cutout is created with a large box-shadow on a small positioned element
  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9998,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
        borderRadius: '8px',
        transition: 'top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease',
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Popover component
// ---------------------------------------------------------------------------

interface PopoverProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  rect: DOMRect | null;
  onNext: () => void;
  onSkip: () => void;
}

const Popover: React.FC<PopoverProps> = ({
  step,
  stepIndex,
  totalSteps,
  rect,
  onNext,
  onSkip,
}) => {
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    zIndex: 9999,
    opacity: 0,
  });

  useEffect(() => {
    if (!rect) return;

    const placement = step.placement ?? 'bottom';
    const gap = 12;
    const popoverWidth = 320;
    const popoverEstimatedHeight = 160;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = rect.top - popoverEstimatedHeight - gap;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - popoverEstimatedHeight / 2;
        left = rect.left - popoverWidth - gap;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - popoverEstimatedHeight / 2;
        left = rect.right + gap;
        break;
    }

    // Keep within viewport
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    left = Math.max(16, Math.min(left, viewportW - popoverWidth - 16));
    top = Math.max(16, Math.min(top, viewportH - popoverEstimatedHeight - 16));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPopoverStyle({
      position: 'fixed',
      zIndex: 9999,
      top,
      left,
      width: popoverWidth,
      opacity: 1,
      transition: 'opacity 0.25s ease',
    });
  }, [rect, step.placement]);

  return (
    <div style={popoverStyle}>
      <div
        className="rounded-[14px] px-6 py-5 font-[Inter,system-ui,-apple-system,sans-serif] bg-white dark:bg-[#1a1f2e] border border-teal-200 dark:border-[rgba(98,255,255,0.25)] text-gray-700 dark:text-[#e2e8f0] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_0_1px_rgba(98,255,255,0.1)]"
      >
        {/* Header row */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="m-0 text-base font-semibold leading-tight text-gray-900 dark:text-white">
            {step.heading}
          </h3>
          <button
            onClick={onSkip}
            aria-label="Close tour"
            className="bg-transparent border-none text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer p-0.5 ml-2 rounded-md flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <p className="m-0 mb-4 text-[13px] leading-[1.55] text-gray-600 dark:text-slate-400">
          {step.body}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center">
          {/* Step dots */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Tour steps">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === stepIndex}
                aria-label={`Go to step ${i + 1}`}
                onClick={i < stepIndex ? () => onSkip() : undefined}
                className={`w-1.5 h-1.5 rounded-full transition-all border-none p-0 cursor-default ${
                  i === stepIndex
                    ? 'bg-teal-500 dark:bg-[#62ffff] w-4'
                    : i < stepIndex
                      ? 'bg-teal-300 dark:bg-[rgba(98,255,255,0.4)]'
                      : 'bg-gray-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={onSkip}
              className="bg-transparent border-none text-gray-500 dark:text-slate-500 text-xs cursor-pointer underline px-2 py-1.5 hover:text-gray-700 dark:hover:text-slate-300"
            >
              Skip tour
            </button>
            <button
              onClick={onNext}
              className="bg-gradient-to-br from-[#13baba] to-[#0d9488] border-none text-white text-[13px] font-semibold cursor-pointer px-[18px] py-[7px] rounded-lg hover:from-[#0fa8a8] hover:to-[#0b7a70] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#13baba]"
            >
              {stepIndex + 1 === totalSteps ? 'Done ✓' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="mt-3 text-[11px] text-gray-400 dark:text-slate-600 m-0">
          <kbd className="font-mono bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded px-1 py-0.5 text-[10px]">←→</kbd>{' '}
          navigate &nbsp;·&nbsp;{' '}
          <kbd className="font-mono bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded px-1 py-0.5 text-[10px]">Esc</kbd>{' '}
          close
        </p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main OnboardingTour component
// ---------------------------------------------------------------------------

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);

  // Only show if tour is not completed
  useEffect(() => {
    if (!isTourComplete()) {
      // Short delay to let the DOM settle after route render
      const timer = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  // Keyboard handler: Escape closes, Arrow keys navigate
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        markTourComplete();
        setVisible(false);
        onClose?.();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentStep((s) => Math.max(s - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [visible, steps.length, onClose]);

  // Recompute spotlight target on each step change
  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;

    const el = document.querySelector(`[data-tour-id="${step.targetId}"]`);
    if (el) {
      // Scroll element into view smoothly before computing rect
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTargetRect(el.getBoundingClientRect());
    } else {
      // Target not found — clear rect so popover renders centred without spotlight
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (!visible) return;
    // Small delay after step change so scroll has time to settle
    const t = setTimeout(updateTargetRect, 80);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [visible, updateTargetRect]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      markTourComplete();
      setVisible(false);
      onClose?.();
    }
  }, [currentStep, steps.length, onClose]);

  const handleSkip = useCallback(() => {
    markTourComplete();
    setVisible(false);
    onClose?.();
  }, [onClose]);

  if (!visible) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Screen-reader live region announces step changes */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {`Step ${currentStep + 1} of ${steps.length}: ${step.heading}`}
      </div>

      {/* Full-screen click-to-skip overlay */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9997 }}
        onClick={handleSkip}
        aria-hidden="true"
      />

      {/* Spotlight cutout */}
      <SpotlightOverlay rect={targetRect} />

      {/* Popover */}
      <div onClick={(e) => e.stopPropagation()}>
        <Popover
          step={step}
          stepIndex={currentStep}
          totalSteps={steps.length}
          rect={targetRect}
          onNext={handleNext}
          onSkip={handleSkip}
        />
      </div>
    </>
  );
};

export default OnboardingTour;

