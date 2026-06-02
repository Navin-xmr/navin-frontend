import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { ToastType } from "../../../context/ToastContext";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  navigateTo?: string;
  onClose: () => void;
}

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
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    if (navigateTo) navigate(navigateTo);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        pointer-events-auto flex items-center justify-between min-w-[320px] max-w-md 
        p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-full duration-300
        cursor-pointer transition-all hover:scale-[1.02]
        bg-background-card border-border
      `}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="text-sm font-medium text-primary">{message}</span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="p-1 ml-4 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-secondary" />
      </button>
    </div>
  );
};
