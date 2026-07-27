import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CopyToClipboardProps {
  value: string;
  label?: string;
  size?: 'sm' | 'md';
  /** How long, in ms, the "copied" checkmark stays visible. Defaults to 2000. */
  successDuration?: number;
  /** Extra classes appended to the button. */
  className?: string;
}

/**
 * Attempt to copy text without the async Clipboard API.
 * Used as a fallback for insecure contexts / older browsers where
 * `navigator.clipboard` is unavailable.
 */
function legacyCopy(value: string): boolean {
  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();
  let succeeded = false;
  try {
    succeeded = document.execCommand('copy');
  } catch {
    succeeded = false;
  }
  document.body.removeChild(textarea);
  return succeeded;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  value,
  label,
  size = 'md',
  successDuration = 2000,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending timer when the component unmounts.
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const flagCopied = () => {
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), successDuration);
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        flagCopied();
        return;
      }
      // Clipboard API unavailable — try the legacy path before giving up.
      if (legacyCopy(value)) {
        flagCopied();
        return;
      }
      addToast('Clipboard is not available in this browser', 'error');
    } catch {
      // writeText rejected (e.g. permissions) — attempt the fallback once more.
      if (legacyCopy(value)) {
        flagCopied();
        return;
      }
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const isEmpty = value.length === 0;
  const iconSize = size === 'sm' ? 12 : 14;
  const btnClass =
    size === 'sm'
      ? 'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs'
      : 'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm';

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isEmpty}
      className={`${btnClass} border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-40 disabled:cursor-not-allowed ${
        copied
          ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
          : 'border-transparent text-text-secondary hover:text-primary hover:border-primary/30 hover:bg-primary/5'
      } ${className}`}
      aria-label={copied ? 'Copied to clipboard' : `Copy ${label ?? value}`}
      aria-live="polite"
      title={value}
    >
      {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
      {label && <span>{copied ? 'Copied' : label}</span>}
    </button>
  );
};

export default CopyToClipboard;
