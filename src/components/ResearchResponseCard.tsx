import React, { useState } from 'react';
import { smartSummaryService, SmartSummaryResult } from '../services/smartSummaryService';

export interface ResearchCardData {
  id: string;
  title: string;
  content: string;
  publisher?: string;
  date?: string;
  category?: string;
  location?: string;
  url?: string;
  snippet?: string;
  verified?: boolean;
}

interface ResearchResponseCardProps {
  card: ResearchCardData;
  className?: string;
  defaultExpanded?: boolean;
  onInspectCitation?: (id: string) => void;
}

export const ResearchResponseCard: React.FC<ResearchResponseCardProps> = ({
  card,
  className = '',
  defaultExpanded = false,
  onInspectCitation,
}) => {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SmartSummaryResult | null>(() => {
    return smartSummaryService.getCached({
      title: card.title,
      content: card.content || card.snippet || '',
      sourceId: card.id,
    }) || null;
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateSummary = async () => {
    if (isOpen && summary) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);

    // If already cached in memory, display immediately
    const cached = smartSummaryService.getCached({
      title: card.title,
      content: card.content || card.snippet || '',
      sourceId: card.id,
    });

    if (cached) {
      setSummary(cached);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await smartSummaryService.generateSummary({
        title: card.title,
        content: card.content || card.snippet || card.title,
        publisher: card.publisher,
        category: card.category,
        location: card.location,
        sourceId: card.id,
      });

      setSummary(result);
    } catch (err: any) {
      console.error('SmartSummaryService error in ResearchResponseCard:', err);
      setError(err?.message || 'Failed to analyze text with Gemini API. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!summary) return;

    const formatted = `Smart Summary: ${card.title}
• Urban Planning: ${summary.urbanPlanning}
• Policy / Gov: ${summary.policyImpact}
• Infrastructure / Community: ${summary.communityImpact}

(Sourced from ${card.publisher || 'Civic Document'})`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-surface-card rounded-xl p-4 border border-border-subtle hover:border-primary/40 transition-all shadow-xs space-y-3 ${className}`}
    >
      {/* Top Metadata Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {card.publisher && (
            <span className="font-citation-ref text-citation-ref px-2 py-0.5 rounded bg-brand-tint text-primary font-bold border border-primary/20">
              {card.publisher}
            </span>
          )}
          {card.category && (
            <span className="font-micro-meta text-[10px] text-text-muted uppercase">
              {card.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-text-muted text-[11px] font-mono">
          {card.location && <span>{card.location}</span>}
          {card.date && (
            <>
              <span>•</span>
              <span>{card.date}</span>
            </>
          )}
          {card.verified && (
            <span className="text-secondary font-bold flex items-center gap-0.5 font-citation-ref text-[10px]">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              <span>VERIFIED</span>
            </span>
          )}
        </div>
      </div>

      {/* Article Title */}
      <h3 className="font-headline-sm text-sm font-bold text-dark-surface leading-snug">
        {card.title}
      </h3>

      {/* Article Body Content / Findings */}
      <p className="font-body-compact text-xs text-text-body leading-relaxed line-clamp-3">
        {card.content || card.snippet}
      </p>

      {/* Action Strip: Smart Summary Button + Source Link */}
      <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            isOpen
              ? 'bg-primary text-on-primary border-primary shadow-xs'
              : 'bg-brand-tint text-primary border-primary/30 hover:bg-primary-container hover:text-on-primary'
          }`}
          title="Interface with Gemini API to condense findings into 3 urban impacts"
        >
          <span className={`material-symbols-outlined text-[15px] ${isLoading ? 'animate-spin' : ''}`}>
            {isLoading ? 'sync' : 'auto_awesome'}
          </span>
          <span>{isLoading ? 'Analyzing with Gemini...' : isOpen ? 'Hide Summary' : 'Smart Summary'}</span>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {card.url && (
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-citation-ref text-xs text-primary font-bold hover:underline"
            >
              <span>View Primary Source</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </a>
          )}
          {onInspectCitation && (
            <button
              type="button"
              onClick={() => onInspectCitation(card.id)}
              className="inline-flex items-center gap-1 font-citation-ref text-xs text-text-muted hover:text-dark-surface font-semibold cursor-pointer"
            >
              <span>Dossier</span>
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* EXPANDABLE SMART SUMMARY PANEL WITH GRACEFUL LOADING & ERROR STATES */}
      {isOpen && (
        <div className="p-3.5 bg-surface-canvas rounded-lg border border-primary/30 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
              <span className="font-headline-sm text-xs font-bold text-dark-surface uppercase tracking-wide">
                Smart Summary
              </span>
              <span className="font-citation-ref text-[9px] px-1.5 py-0.2 rounded bg-brand-tint text-primary font-bold border border-primary/20">
                AI interpretation
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {summary && !isLoading && (
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="p-1 rounded text-text-muted hover:text-primary hover:bg-surface-card transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                  title="Copy 3 bullet points"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-text-muted hover:text-dark-surface hover:bg-surface-card transition-colors cursor-pointer"
                title="Collapse"
              >
                <span className="material-symbols-outlined text-[16px]">expand_less</span>
              </button>
            </div>
          </div>

          {/* 1. LOADING STATE */}
          {isLoading && (
            <div className="space-y-2.5 py-1">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="material-symbols-outlined text-[16px] text-primary animate-spin">
                  progress_activity
                </span>
                <span>
                  Consulting Gemini API: Synthesizing Urban Planning, Policy, and Community impacts...
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded animate-pulse w-11/12"></div>
                <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded animate-pulse w-5/6"></div>
                <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded animate-pulse w-4/6"></div>
              </div>
            </div>
          )}

          {/* 2. ERROR STATE (HANDLED GRACEFULLY WITH RETRY) */}
          {error && !isLoading && (
            <div className="p-3 rounded-lg bg-critical-red/10 border border-critical-red/30 space-y-2 text-xs text-critical-red">
              <div className="flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>Analysis Error</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                {error}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  className="px-3 py-1 rounded bg-critical-red text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">refresh</span>
                  <span>Retry Analysis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 rounded text-text-muted hover:text-dark-surface text-xs font-medium cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* 3. SUCCESS STATE (EXACTLY 3 BULLET POINTS) */}
          {summary && !isLoading && !error && (
            <div className="space-y-2.5">
              <ul className="space-y-2 text-xs text-dark-surface font-body-compact">
                {/* 1. Urban Planning Impact */}
                <li className="flex items-start gap-2.5 bg-surface-card p-2.5 rounded-lg border border-border-subtle/80">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-citation-ref text-[10px] font-bold shrink-0 mt-0.5 border border-blue-200 dark:border-blue-800">
                    <span className="material-symbols-outlined text-[13px]">location_city</span>
                    <span>Urban Planning</span>
                  </span>
                  <span className="leading-relaxed">
                    {summary.urbanPlanning}
                  </span>
                </li>

                {/* 2. Policy / Government Impact */}
                <li className="flex items-start gap-2.5 bg-surface-card p-2.5 rounded-lg border border-border-subtle/80">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-citation-ref text-[10px] font-bold shrink-0 mt-0.5 border border-purple-200 dark:border-purple-800">
                    <span className="material-symbols-outlined text-[13px]">policy</span>
                    <span>Policy / Gov</span>
                  </span>
                  <span className="leading-relaxed">
                    {summary.policyImpact}
                  </span>
                </li>

                {/* 3. Infrastructure / Community Impact */}
                <li className="flex items-start gap-2.5 bg-surface-card p-2.5 rounded-lg border border-border-subtle/80">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-citation-ref text-[10px] font-bold shrink-0 mt-0.5 border border-amber-200 dark:border-amber-800">
                    <span className="material-symbols-outlined text-[13px]">groups</span>
                    <span>Infrastructure &amp; Community</span>
                  </span>
                  <span className="leading-relaxed">
                    {summary.communityImpact}
                  </span>
                </li>
              </ul>

              {/* Attribution and Disclaimer */}
              <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between text-[10px] text-text-muted">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-secondary">verified_user</span>
                  <span>Synthesized by SmartSummaryService bounded to source content.</span>
                </span>
                {summary.fromCache && (
                  <span className="font-citation-ref text-[9px] text-text-muted">cached session</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ResearchResponseCardsProps {
  cards: ResearchCardData[];
  className?: string;
  onInspectCitation?: (id: string) => void;
}

export const ResearchResponseCards: React.FC<ResearchResponseCardsProps> = ({
  cards,
  className = '',
  onInspectCitation,
}) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 bg-surface-canvas rounded-xl border border-dashed border-border-subtle text-center text-xs text-text-muted space-y-1">
        <span className="material-symbols-outlined text-[24px]">inbox</span>
        <p>No research response articles currently available.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {cards.map((card) => (
        <ResearchResponseCard
          key={card.id}
          card={card}
          onInspectCitation={onInspectCitation}
        />
      ))}
    </div>
  );
};
