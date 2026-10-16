import React from 'react';
import { Save } from 'lucide-react';

interface SectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  dirty: boolean;
  onSave: () => void;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  icon,
  dirty,
  onSave,
  children,
}) => (
  <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm shadow-slate-950/30">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {dirty && (
              <span
                aria-label="unsaved changes"
                className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400"
              />
            )}
          </div>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
      >
        <Save size={16} />
        Save {title}
      </button>
    </div>
    {children}
  </section>
);

export default SectionCard;
