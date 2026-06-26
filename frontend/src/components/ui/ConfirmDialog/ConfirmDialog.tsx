import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'default',
  isLoading = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isLoading) {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  // Trap Focus
  useEffect(() => {
    if (!isOpen) return;

    const currentDialog = dialogRef.current;
    if (!currentDialog) return;

    const focusableElements = currentDialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    firstElement.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    currentDialog.addEventListener('keydown', handleTabKey);
    return () => {
      currentDialog.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Variant Configuration
  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="text-red-500" size={24} />,
      iconBg: 'bg-red-500/10',
      buttonBg: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: <AlertTriangle className="text-amber-500" size={24} />,
      iconBg: 'bg-amber-500/10',
      buttonBg: 'bg-amber-500 hover:bg-amber-600',
    },
    default: {
      icon: <Info className="text-accent-blue" size={24} />,
      iconBg: 'bg-accent-blue/10',
      buttonBg: 'bg-accent-blue hover:bg-blue-600',
    },
  };

  const currentVariant = variantStyles[variant];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-message"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-[#14171e] border border-[#1e293b] rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex gap-4 items-start">
            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${currentVariant.iconBg}`}>
              {currentVariant.icon}
            </div>
            <div className="flex-1 mt-1">
              <h3 id="dialog-title" className="text-lg font-bold text-white mb-2">
                {title}
              </h3>
              <p id="dialog-message" className="text-sm text-[#94a3b8] leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#0b0e14] border-t border-[#1e293b] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-[#cbd5e1] bg-transparent hover:bg-[#1e293b] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${currentVariant.buttonBg}`}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
