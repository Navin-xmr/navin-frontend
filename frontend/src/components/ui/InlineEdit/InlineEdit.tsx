import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';

export interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  validate?: (v: string) => string | null;
  placeholder?: string;
  type?: 'text' | 'number' | 'textarea';
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  validate,
  placeholder = 'Click to edit',
  type = 'text',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditStart = () => {
    setCurrentValue(value);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentValue(value);
    setError(null);
  };

  const handleSave = async () => {
    if (validate) {
      const validationError = validate(currentValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (currentValue === value) {
      handleCancel();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(currentValue);
      setIsEditing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1 items-start w-full relative">
        <div className="flex items-start gap-2 w-full">
          {type === 'textarea' ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={currentValue}
              onChange={(e) => {
                setCurrentValue(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className={`w-full min-h-[80px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-y text-sm transition-colors ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              value={currentValue}
              onChange={(e) => {
                setCurrentValue(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm transition-colors ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
          )}
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-shrink-0 p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            title="Save"
            aria-label="Save"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-1 text-sm text-red-600 mt-1 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleEditStart}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEditStart();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Click to edit"
      className={`px-3 py-2 -mx-3 -my-2 rounded-md cursor-text focus:outline-none focus:bg-slate-100 hover:bg-slate-100 transition-colors duration-300 group ${
        isSuccess ? 'bg-green-100 text-green-800' : 'text-slate-900'
      }`}
    >
      {value ? (
        <span className={`${type === 'textarea' ? 'whitespace-pre-wrap block' : 'block break-words'} ${isSuccess ? 'font-medium' : ''}`}>
          {value}
        </span>
      ) : (
        <span className="text-slate-400 italic group-hover:text-slate-500 transition-colors block">
          {placeholder}
        </span>
      )}
    </div>
  );
};
