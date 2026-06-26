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
        style={{
          background: '#1a1f2e',
          border: '1px solid rgba(98,255,255,0.25)',
          borderRadius: '14px',
          padding: '20px 24px',
          color: '#e2e8f0',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(98,255,255,0.1)',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: '#ffffff',
              lineHeight: 1.3,
            }}
          >
            {step.heading}
          </h3>
          <button
            onClick={onSkip}
            aria-label="Close tour"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: 2,
              marginLeft: 8,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <p
          style={{
            margin: '0 0 16px',
            fontSize: 13,
            lineHeight: 1.55,
            color: '#94a3b8',
          }}
        >
          {step.body}
        </p>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Step counter */}
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {stepIndex + 1} of {totalSteps}
          </span>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={onSkip}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '6px 8px',
              }}
            >
              Skip
            </button>
            <button
              onClick={onNext}
              style={{
                background: 'linear-gradient(135deg, #13baba 0%, #0d9488 100%)',
                border: 'none',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '7px 18px',
                borderRadius: 8,
              }}
            >
              {stepIndex + 1 === totalSteps ? 'Done' : 'Next →'}
            </button>
          </div>
        </div>
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
      // Short delay to let the DOM settle
      const timer = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  // Recompute spotlight target on each step change
  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;

    const el = document.querySelector(`[data-tour-id="${step.targetId}"]`);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (!visible) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateTargetRect();

    // Recompute on resize / scroll
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
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
      {/* Full-screen click-through blocker */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9997,
        }}
        onClick={handleSkip}
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

