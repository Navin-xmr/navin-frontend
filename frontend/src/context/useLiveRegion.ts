import { createContext, useContext } from "react";

export interface LiveRegionContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

export const LiveRegionContext = createContext<LiveRegionContextType | undefined>(undefined);

export const useLiveRegion = () => {
  const context = useContext(LiveRegionContext);
  if (!context) throw new Error("useLiveRegion must be used within a LiveRegionProvider");
  return context;
};
