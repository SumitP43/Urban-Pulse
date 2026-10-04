import React, { useState } from 'react';
import { smartSummaryService, SmartSummaryResult } from '../services/smartSummaryService';

export type SmartSummaryData = SmartSummaryResult;

interface SmartSummaryProps {
  title: string;
  content: string;
  publisher?: string;
  category?: string;
  sourceId?: string;
  className?: string;
  compact?: boolean;
}

export const SmartSummary: React.FC<SmartSummaryProps> = ({
  title,
  content,
  publisher,
  category = 'Urban Planning & Infrastructure',
  sourceId,
  className = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SmartSummaryData | null>(() => {
    return smartSummaryService.getCached({ title, content, sourceId }) || null;
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFetchSummary = async () => {
    if (isOpen && summary) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);

    const cached = smartSummaryService.getCached({ title, content, sourceId });
    if (cached) {
      setSummary(cached);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await smartSummaryService.generateSummary({
        title,
        content,
        publisher,
        category,
        sourceId,
      });

      setSummary(data);
    } catch (err: any) {
      console.error('Smart Summary Error via SmartSummaryService:', err);
      setError(err?.message || 'Could not generate smart summary. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!summary) return;
    const textToCopy = `Smart Summary for: "${title}"
• Urban Planning: ${summary.urbanPlanning}
• Policy Impact: ${summary.policyImpact}
• Community Impact: ${summary.communityImpact}

(Synthesized from ${publisher || 'source record'} findings)`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`smart-summary-container ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleFetchSummary}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border ${
          isOpen
            ? 'bg-primary text-on-primary border-primary shadow-xs'
            : 'bg-brand-tint/60 text-primary border-primary/30 hover:bg-primary-container hover:text-on-primary'
        } ${compact ? 'text-[11px] py-0.5 px-2' : ''}`}
        title="Analyze article findings with Gemini and condense into 3 key urban impact bullets"
      >
        <span className={`material-symbols-outlined text-[15px] ${isLoading ? 'animate-spin' : ''}`}>
          {isLoading ? 'sync' : 'auto_awesome'}
        </span>
        <span>
          {isLoading ? 'Summarizing...' : isOpen ? 'Hide Summary' : 'Smart Summary'}
        </span>
      </button>

      {/* Expanded Summary Card */}
      {isOpen && (
        <div className="mt-2.5 p-3.5 bg-surface-card rounded-lg border border-primary/30 shadow-sm animate-in fade-in slide-in-from-top-1 duration-150 space-y-2.5">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
              <span className="font-headline-sm text-xs font-bold text-dark-surface uppercase tracking-wide">
                Smart Summary
              </span>
              <span className="font-citation-ref text-[9px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                AI interpretation
              </span>
            </div>

            <div className="flex items-center gap-1">
              {summary && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded text-text-muted hover:text-primary hover:bg-surface-container transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                  title="Copy 3 bullet points to clipboard"
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
                className="p-1 rounded text-text-muted hover:text-dark-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Collapse summary"
              >
                <span className="material-symbols-outlined text-[16px]">expand_less</span>
              </button>
            </div>
          </div>

          {/* Loading Shimmer State */}
          {isLoading && (
            <div className="space-y-2 py-1">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="material-symbols-outlined text-[15px] text-primary animate-spin">progress_activity</span>
                <span>Extracting urban planning, policy, and infrastructure implications...</span>
              </div>
              <div className="h-3 bg-surface-container-high rounded animate-pulse w-5/6"></div>
              <div className="h-3 bg-surface-container-high rounded animate-pulse w-4/6"></div>
              <div className="h-3 bg-surface-container-high rounded animate-pulse w-3/4"></div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-2.5 rounded bg-critical-red/10 border border-critical-red/30 text-critical-red text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleFetchSummary}
                className="font-bold underline cursor-pointer ml-2 hover:opacity-80"
              >
                Retry
              </button>
            </div>
          )}

          {/* Success 3-Bullet List */}
          {summary && !isLoading && (
            <div className="space-y-2">
              <ul className="space-y-2 text-xs text-dark-surface font-body-compact">
                {/* 1. Urban Planning Impact */}
                <li className="flex items-start gap-2 bg-surface-canvas p-2.5 rounded border border-border-subtle/70">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-citation-ref text-[10px] font-bold shrink-0 mt-0.5 border border-blue-200 dark:border-blue-800">
                    <span className="material-symbols-outlined text-[12px]">location_city</span>
                    <span>Urban Planning</span>
                  </span>
                  <span className="leading-relaxed">
                    {summary.urbanPlanning}
                  </span>
                </li>

                {/* 2. Policy / Government Impact */}
                <li className="flex items-start gap-2 bg-surface-canvas p-2.5 rounded border border-border-subtle/70">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-citation-ref text-[10px] font-bold shrink-0 mt-0.5 border border-purple-200 dark:border-purple-800">
                    <span className="material-symbols-outlined text-[12px]">policy</span>
                    <span>Policy Impact</span>
                  </span>
                  <span className="leading-relaxed">
                    {summary.policyImpact}
                  </span>
                </li>

                {/* 3. Infrastructure / Community Impact */}
                <li className="flex items-start gap-2 bg-surface-canvas p-2.5 rounded border border-border-subtle/70">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-citation-ref text-[10px] font-bold shrink-0 mt-0.5 border border-amber-200 dark:border-amber-800">
                    <span className="material-symbols-outlined text-[12px]">groups</span>
                    <span>Community Impact</span>
                  </span>
                  <span className="leading-relaxed">
                    {summary.communityImpact}
                  </span>
                </li>
              </ul>

              {/* Attribution / Factual Disclaimer */}
              <div className="pt-1.5 border-t border-border-subtle/60 flex items-center justify-between text-[10px] text-text-muted">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-secondary">verified_user</span>
                  <span>Synthesized directly from source findings. Missing dimensions noted as insufficient data.</span>
                </span>
                {summary.fromCache && (
                  <span className="font-citation-ref text-[9px] text-text-muted">cached</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
