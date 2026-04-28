import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface DeliveryConfirmationProps {
  shipmentId: string;
  status: string;
  onConfirm?: (shipmentId: string, rating: number, feedback: string) => Promise<void>;
}

type ViewState = 'prompt' | 'form' | 'success';

const STAR_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const DeliveryConfirmation: React.FC<DeliveryConfirmationProps> = ({
  shipmentId,
  status,
  onConfirm,
}) => {
  const [view, setView] = useState<ViewState>('prompt');
  const [rating, setRating] = useState<number>(0);
  const [hovered, setHovered] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedRating, setSubmittedRating] = useState<number>(0);
  const submitGuard = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleConfirmReceipt = () => setView('form');

  useEffect(() => {
    if (view === 'form') {
      const firstRadio = containerRef.current?.querySelector('button[role="radio"]') as HTMLButtonElement | null;
      firstRadio?.focus();
    }
    if (view === 'success') {
      const successEl = containerRef.current?.querySelector('[data-success]') as HTMLElement | null;
      successEl?.focus();
    }
  }, [view]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || submitGuard.current || isSubmitting) return;

    submitGuard.current = true;
    setIsSubmitting(true);
    setError('');

    try {
      if (onConfirm) {
        await onConfirm(shipmentId, rating, feedback);
      } else {
        // Simulate async call when no handler provided
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      }
      setSubmittedRating(rating);
      setView('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      submitGuard.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, feedback, shipmentId, onConfirm, isSubmitting]);

  const handleStarKeyDown = (e: React.KeyboardEvent, star: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setRating(star);
    }
  };

  const displayRating = hovered || rating;

  if (status !== 'delivered') return null;

  return (
    <div
      ref={containerRef}
      className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl px-8 py-10 backdrop-blur-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 md:px-5 md:py-8 md:rounded-2xl sm:px-4 sm:py-6"
      aria-label="Delivery confirmation"
    >
      <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white text-center mb-8">
        CONFIRM <span className="text-[#00d4c8]">DELIVERY</span>
      </h2>

      {/* Fixed-height content area to prevent layout shift */}
      <div className="min-h-[220px] flex flex-col justify-center">

        {view === 'prompt' && (
          <div className="flex flex-col items-center gap-6 text-center animate-fade-in-up">
            <p className="text-[rgba(200,230,240,0.75)] text-base leading-relaxed max-w-sm">
              Your shipment <span className="text-white font-semibold">{shipmentId}</span> has been delivered. Please confirm receipt and share your experience.
            </p>
            <button
              type="button"
              onClick={handleConfirmReceipt}
              className="bg-[linear-gradient(135deg,#00d4c8_0%,#009990_100%)] text-black font-semibold px-8 py-3.5 rounded-xl text-base transition-all shadow-[0_4px_15px_rgba(0,212,200,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,212,200,0.4)] focus:outline-none focus:ring-2 focus:ring-[#00d4c8] focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Confirm Receipt
            </button>
          </div>
        )}

        {view === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-fade-in-up" noValidate>
            {/* Star rating */}
            <div className="flex flex-col items-center gap-3">
              <label className="text-white font-medium text-sm" id="rating-label">
                Rate your delivery experience <span className="text-[#ef4444]" aria-hidden="true">*</span>
              </label>
              <div
                role="radiogroup"
                aria-labelledby="rating-label"
                aria-required="true"
                className="flex gap-2"
                onMouseLeave={() => setHovered(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} star${star > 1 ? 's' : ''} — ${STAR_LABELS[star - 1]}`}
                    tabIndex={rating === star || (rating === 0 && star === 1) ? 0 : -1}
                    className="text-3xl leading-none transition-transform duration-100 focus:outline-none focus:ring-2 focus:ring-[#00d4c8] focus:ring-offset-1 focus:ring-offset-transparent rounded"
                    style={{ transform: displayRating >= star ? 'scale(1.15)' : 'scale(1)' }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onKeyDown={(e) => handleStarKeyDown(e, star)}
                  >
                    <span aria-hidden="true" className={displayRating >= star ? 'text-[#fbbf24]' : 'text-[rgba(255,255,255,0.2)]'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <span className="text-[#00d4c8] text-sm font-medium" aria-live="polite">
                  {STAR_LABELS[displayRating - 1]}
                </span>
              )}
            </div>

            {/* Feedback textarea */}
            <div className="flex flex-col gap-2">
              <label htmlFor="delivery-feedback" className="text-white font-medium text-sm">
                Feedback <span className="text-[rgba(255,255,255,0.4)] font-normal">(optional)</span>
              </label>
              <textarea
                id="delivery-feedback"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share any comments about your delivery..."
                className="bg-[rgba(0,0,0,0.3)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-xl px-4 py-3 text-white text-sm font-[inherit] resize-none transition-all w-full focus:outline-none focus:border-[#00d4c8] focus:shadow-[0_0_0_4px_rgba(0,212,200,0.1)] placeholder:text-[rgba(255,255,255,0.3)]"
              />
            </div>

            {error && (
              <p role="alert" className="text-[#ef4444] text-sm text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="bg-[linear-gradient(135deg,#00d4c8_0%,#009990_100%)] text-black font-semibold py-4 rounded-xl text-base transition-all shadow-[0_4px_15px_rgba(0,212,200,0.3)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(0,212,200,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-[#00d4c8] focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin-svg w-5 h-5" viewBox="0 0 50 50" aria-hidden="true">
                    <circle className="animate-dash" cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="currentColor" />
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Confirmation'}
            </button>
          </form>
        )}

        {view === 'success' && (
          <div data-success tabIndex={-1} className="flex flex-col items-center gap-5 text-center animate-fade-in-up" role="status" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-[rgba(0,212,200,0.15)] border border-[rgba(0,212,200,0.3)] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#00d4c8]" />
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-1">Thank you for confirming!</h3>
              <p className="text-[rgba(200,230,240,0.75)] text-sm">Your feedback helps us improve our service.</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[rgba(255,255,255,0.5)] text-xs uppercase tracking-wider">Your rating</span>
              <div className="flex gap-1" aria-label={`Submitted rating: ${submittedRating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`text-2xl ${star <= submittedRating ? 'text-[#fbbf24]' : 'text-[rgba(255,255,255,0.2)]'}`} aria-hidden="true">
                    ★
                  </span>
                ))}
              </div>
              <span className="text-[#00d4c8] text-sm font-medium">{STAR_LABELS[submittedRating - 1]}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DeliveryConfirmation;
