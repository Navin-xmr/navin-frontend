import React, { useState } from 'react';
import { Sparkles, Star, CheckCircle2 } from 'lucide-react';
import { RELEASE_NOTES, type ReleaseChange } from './releaseData';
import ReleaseCard from './ReleaseCard';

const WhatsNewPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | ReleaseChange['type']>('all');

  const filteredReleases =
    filter === 'all'
      ? RELEASE_NOTES
      : RELEASE_NOTES.filter((r) => r.changes.some((c) => c.type === filter));

  const filterOptions: { label: string; value: typeof filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Features', value: 'feature' },
    { label: 'Improvements', value: 'improvement' },
    { label: 'Bug Fixes', value: 'fix' },
    { label: 'Security', value: 'security' },
  ];

  return (
    <div className="font-sans text-white bg-transparent w-full max-w-[900px] mx-auto min-h-[calc(100vh-72px)] px-[46px] py-6 flex flex-col gap-8 max-md:px-4 max-md:pb-[90px]">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[rgba(98,255,255,0.08)] border border-[rgba(98,255,255,0.2)] rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-[#62ffff]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight m-0 mb-0.5">
              What's New
            </h1>
            <p className="text-[#94a3b8] text-sm m-0">
              Release notes and platform updates for Navin
            </p>
          </div>
        </div>
      </div>

      {/* Latest release banner */}
      <div className="bg-[rgba(98,255,255,0.04)] border border-[rgba(98,255,255,0.2)] rounded-xl px-6 py-5">
        <div className="flex items-start gap-4 max-md:flex-col">
          <div className="w-10 h-10 bg-[rgba(98,255,255,0.1)] rounded-xl flex items-center justify-center shrink-0">
            <Star size={20} className="text-[#62ffff]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#62ffff]">
                Latest Release
              </span>
              <span className="text-[10px] text-[#64748b]">·</span>
              <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">
                v{RELEASE_NOTES[0].version} — {RELEASE_NOTES[0].date}
              </span>
            </div>
            <h2 className="text-base font-bold text-white m-0 mb-1">
              {RELEASE_NOTES[0].title}
            </h2>
            <p className="text-sm text-[#94a3b8] m-0 leading-relaxed max-w-2xl">
              {RELEASE_NOTES[0].summary}
            </p>
            {RELEASE_NOTES[0].highlights && (
              <ul className="mt-3 space-y-1.5 m-0 pl-0 list-none">
                {RELEASE_NOTES[0].highlights.slice(0, 3).map((hl, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#cbd5e1]">
                    <CheckCircle2 size={13} className="text-accent-green shrink-0" />
                    {hl}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="flex items-center gap-2 flex-wrap"
        role="group"
        aria-label="Filter releases by type"
      >
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === opt.value
                ? 'bg-accent-blue border-accent-blue text-white'
                : 'bg-background-card border-border text-[#94a3b8] hover:border-[#334155] hover:text-white'
            }`}
            aria-pressed={filter === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Release notes list */}
      <div className="flex flex-col gap-4">
        {filteredReleases.length === 0 ? (
          <div className="bg-background-card border border-[rgba(30,41,59,0.7)] rounded-xl px-6 py-12 flex flex-col items-center text-center gap-3">
            <Sparkles size={32} className="text-[#334155]" />
            <p className="text-sm text-[#94a3b8] m-0">No releases match this filter.</p>
          </div>
        ) : (
          filteredReleases.map((release, idx) => (
            <ReleaseCard
              key={release.version}
              release={release}
              isLatest={idx === 0 && filter === 'all'}
              defaultExpanded={idx === 0}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-[rgba(30,41,59,0.5)]">
        <p className="text-xs text-[#64748b] m-0">
          View the full changelog and open issues on{' '}
          <a
            href="https://github.com/Navin-xmr/navin-frontend/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue no-underline hover:underline font-medium"
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
};

export default WhatsNewPage;
