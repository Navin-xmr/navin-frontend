import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CopyToClipboardProps {
  value: string;
  label?: string;
  size?: 'sm' | 'md';
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ value, label, size = 'md' }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      addToast('Clipboard API is not available in this browser', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const iconSize = size === 'sm' ? 12 : 14;
  const btnClass =
    size === 'sm'
      ? 'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs'
      : 'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm';

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${btnClass} border transition-colors ${
        copied
          ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
          : 'border-transparent text-text-secondary hover:text-primary hover:border-primary/30 hover:bg-primary/5'
      }`}
      aria-label={`Copy ${label ?? value}`}
      title={value}
    >
      {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
      {label && <span>{copied ? 'Copied' : label}</span>}
    </button>
  );
};

export default CopyToClipboard;
