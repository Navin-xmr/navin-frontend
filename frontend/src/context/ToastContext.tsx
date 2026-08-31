import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Toast } from "../components/notifications/Toast";
import { useLiveRegion } from "./LiveRegionContext";
import { registerToastBridge } from "./toastBridge";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  navigateTo?: string;
  key?: string;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, navigateTo?: string, key?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { announce } = useLiveRegion();

  const addToast = useCallback(
    (message: string, type: ToastType, navigateTo?: string, key?: string) => {
      const id = key ?? Math.random().toString(36).substring(2, 9);
      setToasts((prev) => {
        const withoutKey = key ? prev.filter((t) => t.key !== key) : prev;
        const newList = [...withoutKey, { id, type, message, navigateTo, key }];
        return newList.slice(-3);
      });
      const priority = type === "error" ? "assertive" : "polite";
      announce(message, priority);
    },
    [announce],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    registerToastBridge(addToast);
    return () => registerToastBridge(undefined);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container for Positioning */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
