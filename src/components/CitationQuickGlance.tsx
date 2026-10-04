import React, { useState, useRef, useEffect } from 'react';
import { Source } from '../types';

interface CitationQuickGlanceProps {
  source?: Source | null;
  identifier?: string;
  label?: string | React.ReactNode;
  onInspectFullCitation?: (sourceId: string) => void;
  className?: string;
}

export const CitationQuickGlance: React.FC<CitationQuickGlanceProps> = ({
  source,
  identifier,
  label,
  onInspectFullCitation,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayId = source?.identifier || identifier || '[SRC]';
  const displayLabel = label || displayId;

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  const handleFocus = () => {
    setIsVisible(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsVisible(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (onInspectFullCitation && (source?.id || identifier)) {
        e.preventDefault();
        onInspectFullCitation(source?.id || identifier!);
      }
    }
  };

  // Close on outside click on touch/mobile devices
  useEffect(() => {
    const handleTouchOutside = (e: TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('touchstart', handleTouchOutside);
    }
    return () => {
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, [isVisible]);

  const handleBadgeClick = (e: React.MouseEvent) => {
    // On touch device or click
    if (window.matchMedia('(hover: none)').matches) {
      // Toggle tooltip first on touch devices
      if (!isVisible) {
        e.preventDefault();
        setIsVisible(true);
        return;
      }
    }

    if (onInspectFullCitation && (source?.id || identifier)) {
      onInspectFullCitation(source?.id || identifier!);
    }
  };

  return (
    <span
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {/* Anchor Citation Badge */}
      <button
        type="button"
        onClick={handleBadgeClick}
        aria-haspopup="dialog"
        aria-expanded={isVisible}
        className="inline-flex items-center justify-center font-citation-ref text-citation-ref text-primary bg-primary-fixed/50 hover:bg-primary-container hover:text-on-primary px-1.5 py-0.2 rounded font-bold transition-all mx-0.5 cursor-pointer shadow-xs focus:ring-2 focus:ring-primary focus:outline-none"
      >
        {displayLabel}
      </button>

      {/* Quick-Glance Tooltip Overlay */}
      {isVisible && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3 bg-dark-card text-on-primary rounded-xl shadow-2xl border border-dark-border text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-dark-border/80 pb-1.5 mb-2 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-citation-ref text-[10px] px-1.5 py-0.2 rounded bg-primary text-on-primary font-bold shrink-0">
                {displayId}
              </span>
              <span className="font-citation-ref text-[10px] uppercase font-bold text-slate-300 truncate">
                Quick Glance
              </span>
            </div>

            {source?.reliabilityTier && (
              <span className="font-citation-ref text-[9px] px-1.5 py-0.2 rounded bg-secondary/20 text-secondary font-bold border border-secondary/30 shrink-0">
                {source.reliabilityTier}
              </span>
            )}
          </div>

          {/* Title */}
          <h5 className="font-headline-sm text-xs font-bold text-white line-clamp-2 leading-snug">
            {source?.title || `Archival Source ${displayId}`}
          </h5>

          {/* Metadata Grid */}
          <div className="mt-2 space-y-1 text-[11px] text-slate-300 font-body-compact">
            {/* Publisher / Agency */}
            {source?.meta && (
              <div className="flex items-start gap-1">
                <span className="text-slate-400 font-semibold shrink-0">Publisher:</span>
                <span className="truncate text-slate-200">{source.meta.split('•')[0]?.trim()}</span>
              </div>
            )}

            {/* Type & Doc ID */}
            {source?.documentType && (
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-semibold shrink-0">Type:</span>
                <span className="text-slate-200">{source.documentType}</span>
                {source.docId && (
                  <span className="text-slate-400 font-mono text-[9px] truncate">({source.docId})</span>
                )}
              </div>
            )}

            {/* Cited Location / Pages */}
            {source?.citedPages && (
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-semibold shrink-0">Pages:</span>
                <span className="text-blue-300 font-mono text-[10px]">{source.citedPages}</span>
              </div>
            )}

            {/* Key Extracted Metric if available */}
            {source?.keyExtractedMetric && (
              <div className="mt-1.5 pt-1.5 border-t border-dark-border/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase font-citation-ref">Key Metric:</span>
                <span className="font-mono font-bold text-secondary">
                  {source.keyExtractedMetric.metric}
                </span>
              </div>
            )}

            {/* Short Source Description / Verbatim Excerpt */}
            {(source?.summary || source?.verbatimExcerpt) && (
              <p className="mt-1.5 pt-1.5 border-t border-dark-border/60 text-[10.5px] text-slate-300 italic line-clamp-2 leading-relaxed">
                "{source.summary || source.verbatimExcerpt?.slice(0, 110) + '...'}"
              </p>
            )}
          </div>

          {/* Quick Action Footer */}
          {onInspectFullCitation && (
            <div className="mt-2.5 pt-2 border-t border-dark-border/80 flex items-center justify-between">
              <span className="text-[9px] text-slate-400">Click to inspect full dossier</span>
              <button
                type="button"
                onClick={() => onInspectFullCitation(source?.id || identifier!)}
                className="text-[10px] font-bold text-primary-fixed hover:text-white flex items-center gap-0.5 cursor-pointer underline"
              >
                <span>Full Citation</span>
                <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Tiny caret arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-dark-border"></div>
        </div>
      )}
    </span>
  );
};
