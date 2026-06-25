import React, { useState, useEffect } from "react";
import {
  shipmentApi,
  NoteResponse,
} from "../../../../services/api/endpoints/shipments";
import { useToast } from "../../../../context/ToastContext";

interface Note {
  id: string;
  author: { name: string; initials: string };
  timestamp: string;
  text: string;
  visibility: "internal" | "customer";
}

interface NotesSectionProps {
  shipmentId: string;
  userRole: "company" | "customer";
}

const mockNotes: Note[] = [
  {
    id: "1",
    author: { name: "Sarah Chen", initials: "SC" },
    timestamp: "2026-02-20 10:30 AM EST",
    text: "Shipment picked up and logged into system. All items accounted for.",
    visibility: "customer",
  },
  {
    id: "2",
    author: { name: "Mike Torres", initials: "MT" },
    timestamp: "2026-02-21 02:15 PM EST",
    text: "Temperature anomaly detected at Philadelphia hub - within acceptable range, monitoring.",
    visibility: "internal",
  },
  {
    id: "3",
    author: { name: "Customer Support", initials: "CS" },
    timestamp: "2026-02-22 09:00 AM EST",
    text: "Your shipment is on schedule and will be delivered tomorrow.",
    visibility: "customer",
  },
];

const NotesSection: React.FC<NotesSectionProps> = ({ shipmentId, userRole }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState<string>("");
  const [visibility, setVisibility] = useState<"internal" | "customer">(
    userRole === "company" ? "internal" : "customer"
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetched: NoteResponse[] = await shipmentApi.getNotes(shipmentId);
        setNotes(fetched);
      } catch {
        // API not available — fall back to mock data
        setNotes(mockNotes);
      }
    };

    fetchNotes();
  }, [shipmentId]);

  const visibleNotes =
    userRole === "company"
      ? notes
      : notes.filter((n) => n.visibility === "customer");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticNote: Note = {
      id: tempId,
      author: { name: "You", initials: "YO" },
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }),
      text: noteText.trim(),
      visibility,
    };

    setNotes((prev) => [...prev, optimisticNote]);
    setNoteText("");
    setIsSubmitting(true);

    try {
      const created: NoteResponse = await shipmentApi.addNote(
        shipmentId,
        optimisticNote.text,
        visibility
      );
      setNotes((prev) =>
        prev.map((n) => (n.id === tempId ? { ...created } : n))
      );
    } catch {
      // Revert optimistic update
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      addToast("Failed to post note. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl px-8 py-12 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 md:px-5 md:py-8 md:rounded-2xl sm:px-4 sm:py-6">
      {/* Title */}
      <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white text-center mb-8">
        SHIPMENT <span className="text-[#00d4c8]">NOTES</span>
      </h2>

      {/* Notes list */}
      <div className="flex flex-col gap-4 mb-8">
        {visibleNotes.length === 0 && (
          <p className="text-center text-[rgba(200,230,240,0.5)] py-8">
            No notes yet.
          </p>
        )}
        {visibleNotes.map((note) => (
          <div
            key={note.id}
            className="bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.06)] rounded-2xl px-6 py-5 flex gap-4"
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full bg-[rgba(0,212,200,0.2)] border border-[rgba(0,212,200,0.5)] flex items-center justify-center shrink-0 text-[#00d4c8] text-sm font-semibold select-none"
              aria-hidden="true"
            >
              {note.author.initials}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-white font-medium text-sm">
                  {note.author.name}
                </span>
                <span className="text-[rgba(200,230,240,0.45)] text-xs">
                  {note.timestamp}
                </span>
                {userRole === "company" && note.visibility === "internal" && (
                  <span className="bg-[rgba(251,191,36,0.15)] text-amber-400 border border-amber-400/30 text-xs px-2 py-0.5 rounded">
                    INTERNAL
                  </span>
                )}
              </div>
              <p className="text-[rgba(200,230,240,0.85)] text-sm leading-relaxed m-0">
                {note.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[rgba(0,212,200,0.2)] mb-8" />

      {/* Compose area */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label
          htmlFor="note-text"
          className="text-white font-medium text-base"
        >
          Add a Note
        </label>
        <textarea
          id="note-text"
          rows={4}
          className="bg-[rgba(0,0,0,0.3)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-xl px-6 py-4 text-white text-base font-[inherit] transition-all w-full focus:outline-none focus:border-[#00d4c8] focus:shadow-[0_0_0_4px_rgba(0,212,200,0.1)] placeholder:text-[rgba(255,255,255,0.3)] resize-none"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write your note here…"
          disabled={isSubmitting}
        />

        {/* Visibility toggle — company only */}
        {userRole === "company" && (
          <div className="flex items-center gap-2">
            <span className="text-[rgba(200,230,240,0.6)] text-sm mr-1">
              Visibility:
            </span>
            <button
              type="button"
              onClick={() => setVisibility("internal")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                visibility === "internal"
                  ? "bg-[rgba(0,212,200,0.2)] border-[#00d4c8] text-[#00d4c8]"
                  : "bg-transparent border-[rgba(0,180,160,0.3)] text-[rgba(200,230,240,0.5)] hover:border-[rgba(0,212,200,0.5)] hover:text-[rgba(200,230,240,0.75)]"
              }`}
            >
              Internal Only
            </button>
            <button
              type="button"
              onClick={() => setVisibility("customer")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                visibility === "customer"
                  ? "bg-[rgba(0,212,200,0.2)] border-[#00d4c8] text-[#00d4c8]"
                  : "bg-transparent border-[rgba(0,180,160,0.3)] text-[rgba(200,230,240,0.5)] hover:border-[rgba(0,212,200,0.5)] hover:text-[rgba(200,230,240,0.75)]"
              }`}
            >
              Customer Visible
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={!noteText.trim() || isSubmitting}
          className="bg-[linear-gradient(135deg,#00d4c8_0%,#009990_100%)] text-black border-none rounded-xl py-4 text-[1rem] font-semibold font-[inherit] cursor-pointer transition-all flex items-center justify-center shadow-[0_4px_15px_rgba(0,212,200,0.3)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(0,212,200,0.4)] disabled:bg-[rgba(255,255,255,0.1)] disabled:text-[rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSubmitting ? "Posting…" : "Post Note"}
        </button>
      </form>
    </div>
  );
};

export default NotesSection;
