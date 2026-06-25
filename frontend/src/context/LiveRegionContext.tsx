import React, { createContext, useContext, useState, useCallback, useRef } from "react";

interface LiveRegionContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const LiveRegionContext = createContext<LiveRegionContextType | undefined>(undefined);

export const LiveRegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");
  const clearTimerRef = useRef<ReturnType<typeof setTimeout>>();

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

  return (
    <LiveRegionContext.Provider value={{ announce }}>
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

// eslint-disable-next-line react-refresh/only-export-components
export const useLiveRegion = () => {
  const context = useContext(LiveRegionContext);
  if (!context) throw new Error("useLiveRegion must be used within a LiveRegionProvider");
  return context;
};
