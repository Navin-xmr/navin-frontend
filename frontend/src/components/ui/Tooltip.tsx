import React, { useState, useRef, useId, useCallback } from 'react';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: Placement;
}

const POSITION_CLASSES: Record<Placement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const THRESHOLD = 80;

const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = 'top' }) => {
  const [visible, setVisible] = useState(false);
  const [effectivePlacement, setEffectivePlacement] = useState<Placement>(placement);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const rawId = useId();
  const tooltipId = `tooltip-${rawId.replace(/:/g, '')}`;

  const computePlacement = useCallback((): Placement => {
    if (!triggerRef.current) return placement;
    const rect = triggerRef.current.getBoundingClientRect();
    const { innerWidth: vw, innerHeight: vh } = window;
    let p = placement;
    if (p === 'top' && rect.top < THRESHOLD) p = 'bottom';
    else if (p === 'bottom' && vh - rect.bottom < THRESHOLD) p = 'top';
    else if (p === 'left' && rect.left < THRESHOLD) p = 'right';
    else if (p === 'right' && vw - rect.right < THRESHOLD) p = 'left';
    return p;
  }, [placement]);

  const show = () => {
    setEffectivePlacement(computePlacement());
    setVisible(true);
  };
  const hide = () => setVisible(false);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        aria-hidden={!visible}
        className={`absolute z-50 pointer-events-none whitespace-nowrap px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#0F1419] text-white border border-[rgba(98,255,255,0.25)] shadow-lg transition-opacity duration-150 ${
          visible ? 'opacity-100' : 'opacity-0'
        } ${POSITION_CLASSES[effectivePlacement]}`}
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
