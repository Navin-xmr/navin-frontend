import React, { useState, useCallback, useMemo, useRef } from "react";
import { LiveRegionContext } from "./useLiveRegion";

export const LiveRegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

    const setter = priority === "assertive" ? setAssertiveMessage : setPoliteMessage;
    setter("");
    requestAnimationFrame(() => {
      setter(message);
    });

    clearTimerRef.current = setTimeout(() => {
      setPoliteMessage("");
      setAssertiveMessage("");
    }, 7000);
  }, []);

  // Stable value: announcing updates this provider's state, and a fresh object
  // here would re-render every consumer on each announcement.
  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <LiveRegionContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        role="status"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      >
        {politeMessage}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
};
