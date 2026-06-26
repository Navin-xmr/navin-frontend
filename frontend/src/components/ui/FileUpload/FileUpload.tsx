import { FileText, Upload, X } from 'lucide-react';
import React, { useCallback, useId, useRef, useState } from 'react';

export interface FileUploadProps {
  accept?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  uploadProgress?: number;
  className?: string;
}

interface FileEntry {
  file: File;
  preview: string | null;
  error: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function validateFile(
  file: File,
  accept: string[] | undefined,
  maxSizeMB: number | undefined,
): string | null {
  if (accept && accept.length > 0) {
    const matchesType = accept.some((pattern) => {
      if (pattern.endsWith('/*')) {
        return file.type.startsWith(pattern.slice(0, -1));
      }
      if (pattern.startsWith('.')) {
        return file.name.toLowerCase().endsWith(pattern.toLowerCase());
      }
      return file.type === pattern;
    });
    if (!matchesType) {
      const readable = accept.join(', ');
      return `File type not allowed. Accepted: ${readable}`;
    }
  }

  if (maxSizeMB !== undefined && file.size > maxSizeMB * 1024 * 1024) {
    return `File exceeds ${maxSizeMB} MB limit (${formatBytes(file.size)})`;
  }

  return null;
}

async function buildEntry(
  file: File,
  accept: string[] | undefined,
  maxSizeMB: number | undefined,
): Promise<FileEntry> {
  const error = validateFile(file, accept, maxSizeMB);

  if (error || !isImageFile(file)) {
    return { file, preview: null, error };
  }

  const preview = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  }).catch(() => null);

  return { file, preview, error };
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSizeMB,
  multiple = false,
  onFilesSelected,
  uploadProgress,
  className = '',
}) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [entries, setEntries] = useState<FileEntry[]>([]);

  const addFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const files = Array.from(incoming);
      const built = await Promise.all(
        files.map((f) => buildEntry(f, accept, maxSizeMB)),
      );

      setEntries((prev) => {
        const next = multiple ? [...prev, ...built] : built;
        const valid = next.filter((e) => !e.error).map((e) => e.file);
        onFilesSelected(valid);
        return next;
      });
    },
    [accept, maxSizeMB, multiple, onFilesSelected],
  );

  const removeEntry = useCallback(
    (index: number) => {
      setEntries((prev) => {
        const next = prev.filter((_, i) => i !== index);
        onFilesSelected(next.filter((e) => !e.error).map((e) => e.file));
        return next;
      });
    },
    [onFilesSelected],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const hasEntries = entries.length > 0;
  const showProgress = uploadProgress !== undefined;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="File upload dropzone. Click or drag and drop files here."
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={[
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all duration-200 select-none outline-none',
          isDragOver
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-background-elevated/40 bg-background-card/40',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200',
            isDragOver ? 'bg-primary/20 text-primary' : 'bg-background-elevated text-text-secondary',
          ].join(' ')}
        >
          <Upload size={22} />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-text-primary">
            {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            or{' '}
            <span className="font-semibold text-primary underline underline-offset-2">
              click to browse
            </span>
          </p>
          {(accept || maxSizeMB) && (
            <p className="mt-2 text-xs text-text-secondary/70">
              {accept && `Accepted: ${accept.join(', ')}`}
              {accept && maxSizeMB && ' · '}
              {maxSizeMB && `Max ${maxSizeMB} MB`}
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept?.join(',')}
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Upload progress bar */}
      {showProgress && (
        <div className="rounded-lg bg-background-elevated px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Uploading…</span>
            <span className="text-xs font-semibold text-white">{Math.round(uploadProgress!)}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={uploadProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Upload progress: ${Math.round(uploadProgress!)}%`}
            className="h-1.5 w-full overflow-hidden rounded-full bg-accent-blue/20"
          >
            <div
              className="h-full rounded-full bg-accent-blue transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, uploadProgress!))}%` }}
            />
          </div>
        </div>
      )}

      {/* File list */}
      {hasEntries && (
        <ul className="flex flex-col gap-2" aria-label="Selected files">
          {entries.map((entry, index) => (
            <li
              key={`${entry.file.name}-${index}`}
              className={[
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                entry.error
                  ? 'border-accent-red/40 bg-accent-red/5'
                  : 'border-border bg-background-elevated',
              ].join(' ')}
            >
              {/* Thumbnail or file icon */}
              <div className="shrink-0">
                {entry.preview ? (
                  <img
                    src={entry.preview}
                    alt={entry.file.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background-card">
                    <FileText
                      size={20}
                      className={entry.error ? 'text-accent-red' : 'text-text-secondary'}
                    />
                  </div>
                )}
              </div>

              {/* Name / size / error */}
              <div className="min-w-0 flex-1">
                <p
                  className={[
                    'truncate text-sm font-medium',
                    entry.error ? 'text-accent-red' : 'text-text-primary',
                  ].join(' ')}
                >
                  {entry.file.name}
                </p>
                {entry.error ? (
                  <p className="mt-0.5 truncate text-xs text-accent-red/80" role="alert">
                    {entry.error}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {formatBytes(entry.file.size)}
                  </p>
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEntry(index);
                }}
                aria-label={`Remove ${entry.file.name}`}
                className="shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:bg-background-card hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUpload;
