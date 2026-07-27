import { useState, useEffect } from 'react';

// The Network Information API isn't in TS's default DOM lib and isn't
// supported in every browser (notably Safari/Firefox) — this stays a
// best-effort signal and degrades to `false` where it's unavailable.
interface NetworkInformation extends EventTarget {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  saveData?: boolean;
}

const SLOW_EFFECTIVE_TYPES = new Set(['slow-2g', '2g']);

function getConnection(): NetworkInformation | undefined {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

function computeIsSlow(): boolean {
  const connection = getConnection();
  if (!connection?.effectiveType) return false;
  return SLOW_EFFECTIVE_TYPES.has(connection.effectiveType);
}

/**
 * Best-effort "is the user on a slow connection" signal, via the Network
 * Information API. `onChange` fires with the freshly-computed value whenever
 * the browser reports a change, so callers can react (e.g. re-arm a
 * dismissed banner) from a real event callback rather than deriving it in
 * render.
 */
export function useSlowConnection(onChange?: (isSlow: boolean) => void): boolean {
  const [isSlow, setIsSlow] = useState(computeIsSlow);

  useEffect(() => {
    const connection = getConnection();
    if (!connection) return;

    const update = () => {
      const next = computeIsSlow();
      setIsSlow(next);
      onChange?.(next);
    };
    connection.addEventListener('change', update);
    return () => connection.removeEventListener('change', update);
  }, [onChange]);

  return isSlow;
}
