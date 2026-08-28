import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

export interface InlineEditFieldProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  label?: string;
  placeholder?: string;
  isEditable?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  validation?: (value: string) => string | null;
  className?: string;
}

const InlineEditField: React.FC<InlineEditFieldProps> = ({
  value,
  onSave,
  label,
  placeholder,
  isEditable = true,
  readOnly = false,
  multiline = false,
  validation,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select();
      } else {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
    setError(null);
  };

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    const validationError = validation?.(editValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
        {multiline ? (
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSaving}
            className="w-full px-3 py-2 rounded-lg border border-primary/50 bg-background-card text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-primary resize-none min-h-20"
          />
        ) : (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSaving}
            className="w-full px-3 py-2 rounded-lg border border-primary/50 bg-background-card text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-primary"
          />
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 text-sm font-medium transition-colors"
            aria-label="Save changes"
          >
            <Check className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-border/30 text-text-secondary hover:bg-border/50 disabled:opacity-50 text-sm font-medium transition-colors"
            aria-label="Cancel editing"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-center gap-2 ${className}`}>
      {label && <label className="text-sm font-medium text-text-secondary block w-full">{label}</label>}
      <div className="flex items-center gap-2 w-full">
        <span className="flex-1 text-text-primary break-words">{value || placeholder}</span>
        {isEditable && !readOnly && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-primary/10 text-text-secondary hover:text-primary transition-all"
            aria-label="Edit field"
            title="Click to edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default InlineEditField;
