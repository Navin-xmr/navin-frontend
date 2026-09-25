import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export type DrawerPlacement = 'left' | 'right';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  placement?: DrawerPlacement;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}


const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  placement = 'right',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Shared focus-trap hook: handles Tab wrapping, Escape to close, focus on mount, restore on unmount
  useFocusTrap(panelRef, isOpen, onClose);

  // Body scroll lock (not handled by useFocusTrap)
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isLeft = placement === 'left';

  return (
    <div className="fixed inset-0 z-50 flex" role="presentation">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className={`relative ${sizeClasses[size]} w-full h-full bg-background-card border-0 shadow-2xl outline-none flex flex-col
          ${isLeft ? 'mr-auto border-r border-border rounded-r-2xl animate-slide-in-left' : 'ml-auto border-l border-border rounded-l-2xl animate-slide-in-right'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2
            id="drawer-title"
            className="text-lg font-semibold font-display text-text-primary"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="flex items-center justify-center w-8 h-8 rounded-full text-text-secondary hover:text-text-primary hover:bg-background-elevated transition-colors duration-200 cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-text-secondary text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
