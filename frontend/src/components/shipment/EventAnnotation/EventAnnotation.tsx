import React, { useState } from 'react';
import { MessageSquare, Send, Trash2, User } from 'lucide-react';

export interface Annotation {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface EventAnnotationProps {
  /** ID of the milestone / shipment event this annotation thread belongs to */
  eventId: string;
  /** Existing annotations to display */
  annotations?: Annotation[];
  /** Current user's display name (defaults to "You") */
  currentUser?: string;
  /** Called when a new annotation is submitted */
  onAdd?: (eventId: string, text: string) => void;
  /** Called when an annotation is deleted */
  onDelete?: (eventId: string, annotationId: string) => void;
}

const EventAnnotation: React.FC<EventAnnotationProps> = ({
  eventId,
  annotations = [],
  currentUser = 'You',
  onAdd,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [localAnnotations, setLocalAnnotations] = useState<Annotation[]>(annotations);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      author: currentUser,
      text: trimmed,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setLocalAnnotations(prev => [...prev, newAnnotation]);
    setDraft('');
    onAdd?.(eventId, trimmed);
  };

  const handleDelete = (annotationId: string) => {
    setLocalAnnotations(prev => prev.filter(a => a.id !== annotationId));
    onDelete?.(eventId, annotationId);
  };

  const count = localAnnotations.length;

  return (
    <div className="mt-4">
      {/* Toggle button */}
      <button
        type="button"
        className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-primary transition-colors duration-200 group"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-controls={`annotations-${eventId}`}
      >
        <MessageSquare className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
        <span>
          {count > 0 ? `${count} annotation${count !== 1 ? 's' : ''}` : 'Add annotation'}
        </span>
        {count > 0 && (
          <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center leading-none">
            {count}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          id={`annotations-${eventId}`}
          className="mt-3 rounded-xl border border-border bg-[rgba(0,0,0,0.2)] p-4 flex flex-col gap-3"
          role="region"
          aria-label="Annotations"
        >
          {/* Existing annotations */}
          {localAnnotations.length > 0 ? (
            <ul className="flex flex-col gap-3 m-0 p-0 list-none">
              {localAnnotations.map(annotation => (
                <li
                  key={annotation.id}
                  className="flex gap-3 group/annotation"
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-accent-blue" aria-hidden="true" />
                  </div>

                  {/* Bubble */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-semibold text-text-primary truncate">
                        {annotation.author}
                      </span>
                      <span className="text-[10px] text-text-secondary/60 whitespace-nowrap">
                        {annotation.timestamp}
                      </span>
                    </div>
                    <p className="text-[0.8125rem] text-text-secondary leading-relaxed m-0 break-words">
                      {annotation.text}
                    </p>
                  </div>

                  {/* Delete — only shown for current user's annotations */}
                  {annotation.author === currentUser && (
                    <button
                      type="button"
                      className="opacity-0 group-hover/annotation:opacity-100 transition-opacity p-1 rounded text-text-secondary/50 hover:text-red-400 hover:bg-red-400/10 self-start mt-0.5 border-none bg-transparent cursor-pointer"
                      onClick={() => handleDelete(annotation.id)}
                      aria-label={`Delete annotation: "${annotation.text.slice(0, 30)}"`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-text-secondary/50 text-center py-1 m-0">
              No annotations yet. Be the first to add one.
            </p>
          )}

          {/* Divider */}
          {localAnnotations.length > 0 && (
            <div className="h-px bg-border/50" aria-hidden="true" />
          )}

          {/* Compose form */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1">
              <label htmlFor={`annotation-input-${eventId}`} className="sr-only">
                Write an annotation
              </label>
              <textarea
                id={`annotation-input-${eventId}`}
                className="w-full resize-none rounded-lg bg-[rgba(255,255,255,0.04)] border border-border/70 text-[0.8125rem] text-text-primary placeholder:text-text-secondary/40 px-3 py-2 focus:outline-none focus:border-primary/60 focus:bg-[rgba(0,217,255,0.04)] transition-all duration-200 leading-relaxed"
                placeholder="Add a note to this event…"
                rows={2}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
                maxLength={500}
                aria-label="Write an annotation"
              />
            </div>
            <button
              type="submit"
              disabled={!draft.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/20 text-primary text-xs font-semibold border border-primary/30 hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer whitespace-nowrap self-end"
              aria-label="Submit annotation"
            >
              <Send className="w-3 h-3" />
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EventAnnotation;
