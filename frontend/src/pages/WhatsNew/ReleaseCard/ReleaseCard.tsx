import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  Star,
} from 'lucide-react';
import {
  type ReleaseNote,
  CHANGE_TYPE_STYLES,
  TAG_STYLES,
  CHANGE_TYPE_ICONS,
  getSectionIcon,
} from '../releaseData';

export interface ReleaseCardProps {
  release: ReleaseNote;
  isLatest: boolean;
  defaultExpanded: boolean;
}

const ReleaseCard: React.FC<ReleaseCardProps> = ({
  release,
  isLatest,
  defaultExpanded,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <article
      className="bg-background-card border border-[rgba(30,41,59,0.7)] rounded-xl overflow-hidden transition-all"
      aria-label={`Release ${release.version}`}
    >
      {/* Card header */}
      <button
        type="button"
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#62ffff]"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Version badge */}
          <div className="shrink-0 mt-0.5">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${TAG_STYLES[release.tag]}`}
            >
              {isLatest && <Star size={10} className="fill-current" />}
              v{release.version}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-white m-0 leading-tight">
                {release.title}
              </h3>
              {isLatest && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(98,255,255,0.12)] text-[#62ffff] border border-[rgba(98,255,255,0.25)] uppercase tracking-wide">
                  <Sparkles size={9} />
                  Latest
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748b] mt-1 m-0">{release.date}</p>
            {!expanded && (
              <p className="text-sm text-[#94a3b8] mt-2 m-0 line-clamp-2 max-w-xl">
                {release.summary}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 text-[#64748b] mt-1">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-6 pb-6 pt-0">
          <p className="text-sm text-[#94a3b8] leading-relaxed mb-5 mt-1">{release.summary}</p>

          {/* Highlights */}
          {release.highlights && release.highlights.length > 0 && (
            <div className="mb-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b] mb-3">
                Highlights
              </h4>
              <ul className="space-y-2 m-0 pl-0 list-none">
                {release.highlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#cbd5e1]">
                    <CheckCircle2
                      size={15}
                      className="text-accent-green shrink-0 mt-[1px]"
                    />
                    {hl}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Changes list */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b] mb-3">
              Changes
            </h4>
            <ul className="space-y-2.5 m-0 pl-0 list-none">
              {release.changes.map((change, i) => {
                const style = CHANGE_TYPE_STYLES[change.type];
                return (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className={`shrink-0 mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.className}`}
                    >
                      {CHANGE_TYPE_ICONS[change.type]}
                      {style.label}
                    </span>
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="shrink-0" aria-hidden="true">
                        {getSectionIcon(change.description)}
                      </span>
                      <span className="text-sm text-[#cbd5e1] leading-relaxed">
                        {change.description}
                      </span>
                      {change.issueNumber && (
                        <a
                          href={`https://github.com/Navin-xmr/navin-frontend/issues/${change.issueNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-0.5 text-xs text-accent-blue no-underline hover:underline font-medium"
                          aria-label={`Issue #${change.issueNumber}`}
                        >
                          #{change.issueNumber}
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
};

export default ReleaseCard;
