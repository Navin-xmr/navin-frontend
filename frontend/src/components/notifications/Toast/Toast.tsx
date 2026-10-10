import React, { useEffect, useRef } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { ToastType } from "../../../context/ToastContext";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  navigateTo?: string;
  onClose: () => void;
}

const AUTO_DISMISS_MS = 5000;

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
};

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  navigateTo,
  onClose,
}) => {
  // The dismiss timer must run once per toast. `onClose` is a fresh closure on
  // every provider render, so it is read through a ref instead of being a
  // dependency — otherwise each new toast would restart the older ones' timers.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  // ToastProvider mounts outside RouterProvider, so router hooks are unavailable here.
  const handleClick = () => {
    if (navigateTo) window.location.assign(navigateTo);
  };

  // Not a live region itself: ToastProvider announces every toast through the
  // app-wide LiveRegionProvider, and a second region here would read it twice.
  return (
    <div
      className="
        pointer-events-auto flex items-center justify-between min-w-[320px] max-w-md 
        p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-full duration-300
        bg-background-card border-border
      "
    >
      {navigateTo ? (
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center gap-3 flex-1 min-w-0 text-left bg-transparent border-none p-0 cursor-pointer transition-all hover:scale-[1.02]"
        >
          {icons[type]}
          <span className="text-sm font-medium text-primary">{message}</span>
        </button>
      ) : (
        <div className="flex items-center gap-3">
          {icons[type]}
          <span className="text-sm font-medium text-primary">{message}</span>
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Dismiss notification"
        className="p-1 ml-4 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-text-secondary" />
      </button>
    </div>
  );
};
