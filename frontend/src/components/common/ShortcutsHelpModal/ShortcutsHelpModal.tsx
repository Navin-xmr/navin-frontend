import React, { useEffect, useRef } from "react";
import { X, Keyboard } from "lucide-react";

export interface ShortcutEntry {
  keys: string;
  label: string;
}

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: ShortcutEntry[];
}

const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({
  isOpen,
  onClose,
  shortcuts,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTab);

    // Focus close button on open
    requestAnimationFrame(() => {
      const closeBtn = dialogRef.current?.querySelector<HTMLElement>(
        '[aria-label="Close shortcuts help"]',
      );
      closeBtn?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-help-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg bg-[#14171e] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1e293b] flex items-center justify-center">
              <Keyboard size={18} className="text-[#62ffff]" />
            </div>
            <h2
              id="shortcuts-help-title"
              className="text-lg font-bold text-white m-0"
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts help"
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2.5 border-b border-[#1e293b] last:border-b-0"
              >
                <span className="text-sm text-[#cbd5e1]">{shortcut.label}</span>
                <kbd className="text-xs font-mono bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded px-2 py-1 text-[#62ffff] whitespace-nowrap">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 bg-[#0b0e14] border-t border-[#1e293b]">
          <p className="text-xs text-slate-500 m-0">
            Press{" "}
            <kbd className="text-xs font-mono bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded px-1.5 py-0.5 text-slate-400">
              ?
            </kbd>{" "}
            or{" "}
            <kbd className="text-xs font-mono bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded px-1.5 py-0.5 text-slate-400">
              Shift+/
            </kbd>{" "}
            to toggle this dialog at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsHelpModal;
