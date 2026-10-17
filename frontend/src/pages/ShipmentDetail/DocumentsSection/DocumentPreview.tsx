import React from "react";
import { formatBytes } from "./documentUtils";

export interface DocumentPreviewProps {
  file: File;
  onRemove: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file, onRemove }) => {
  return (
    <div className="flex flex-col items-center gap-3 p-6 w-full">
      <div className="flex items-center gap-3 bg-[rgba(0,212,200,0.08)] border border-[rgba(0,212,200,0.25)] rounded-xl px-4 py-3 w-full max-w-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00d4c8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span className="text-white text-sm font-medium truncate flex-1">
          {file.name}
        </span>
        <span className="text-[rgba(255,255,255,0.5)] text-xs shrink-0">
          {formatBytes(file.size)}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 text-[rgba(255,255,255,0.4)] hover:text-[#ff3b30] transition-colors"
          aria-label="Remove selected file"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DocumentPreview;
