import React, { useState, useCallback, useEffect } from "react";
import { Toast } from "../components/notifications/Toast";
import { useLiveRegion } from "./useLiveRegion";
import { registerToastBridge } from "./toastBridge";
import { ToastContext } from "./useToast";
import type { ToastMessage, ToastType } from "./useToast";

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
        {toasts.map(({ key: _toastKey, ...toastProps }) => (
          <Toast
            key={toastProps.id}
            {...toastProps}
            onClose={() => removeToast(toastProps.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
