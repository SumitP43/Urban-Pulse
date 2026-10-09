import React, { useState } from 'react';
import { Investigation, Source, AgentLog, ExecutionStep, NavigationPath } from '../types';
import { ASSETS } from '../data/mockData';
import { SmartSummary } from '../components/SmartSummary';
import { CitationQuickGlance } from '../components/CitationQuickGlance';

interface ResearchWorkspaceViewProps {
  investigation: Investigation;
  sources: Source[];
  agentLogs: AgentLog[];
  steps: ExecutionStep[];
  onNavigate: (path: NavigationPath) => void;
  onInspectCitation: (sourceId: string) => void;
  onOpenExport: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const ResearchWorkspaceView: React.FC<ResearchWorkspaceViewProps> = ({
  investigation,
  sources,
  agentLogs,
  steps,
  onNavigate,
  onInspectCitation,
  onOpenExport,
  isPaused,
  onTogglePause
}) => {
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Govt Reports' | 'Datasets' | 'Audits'>('All');
  const [highlightedSource, setHighlightedSource] = useState<string | null>(null);
  const [mobileActiveCol, setMobileActiveCol] = useState<'plan' | 'stream' | 'sources'>('stream');

  const handleSourceHighlight = (sourceId: string) => {
    setHighlightedSource(sourceId);
    const element = document.getElementById(`source-card-${sourceId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    setTimeout(() => {
      setHighlightedSource(null);
    }, 2500);
  };

  const filteredSources = sourceFilter === 'All'
    ? sources
    : sources.filter(s => s.category === sourceFilter);

  return (
    <div className="flex flex-col w-full">
      {/* Top Workspace Sticky Sub-Header */}
      <section className="sticky top-16 z-30 bg-surface-card/95 backdrop-blur-md px-space-lg py-3.5 shadow-sm border-b border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          {/* Left Metadata & Title */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 font-label-code text-label-code bg-surface-container text-primary font-bold px-2 py-0.5 rounded">
                <span className="material-symbols-outlined text-[14px]">token</span>
                {investigation.code}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant font-citation-ref text-citation-ref font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPaused ? 'bg-tertiary' : 'bg-secondary'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-tertiary' : 'bg-secondary'}`}></span>
                </span>
                {isPaused ? 'EXECUTION SUSPENDED' : `LIVE RESEARCH EXECUTION (${investigation.progress}% Complete)`}
              </span>
              <span className="hidden sm:inline text-text-muted font-micro-meta text-micro-meta uppercase tracking-wider">
                Session Token: {investigation.sessionToken}
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md text-dark-surface tracking-tight mt-1 truncate">
              {investigation.title}
            </h1>
            <p className="font-body-compact text-body-compact text-text-muted truncate max-w-4xl">
              Target Scope: {investigation.targetScope}
            </p>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 flex-shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={() => onNavigate('discoveries-and-findings')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-canvas hover:bg-surface-container-high text-dark-surface font-body-medium text-body-medium transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">lightbulb</span>
              <span>View Findings</span>
              <span className="font-citation-ref text-citation-ref bg-primary text-on-primary rounded-full px-1.5 py-0.2 font-bold">
                {investigation.keyFindingsCount}
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container hover:bg-brand-hover text-on-primary font-body-medium text-body-medium shadow-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span>Export Research Report</span>
            </button>
            <button
              type="button"
              onClick={onTogglePause}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer ${
                isPaused 
                  ? 'bg-secondary-container text-on-secondary-container font-semibold' 
                  : 'bg-surface-canvas hover:bg-error-container text-text-body hover:text-critical-red'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isPaused ? 'play_arrow' : 'pause_circle'}
              </span>
              <span className="hidden md:inline font-body-compact text-body-compact font-medium">
                {isPaused ? 'Resume Execution' : 'Pause Execution'}
              </span>
            </button>
          </div>
        </div>

        {/* Active Execution Progress Microbar */}
        <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full transition-all duration-700 ease-out ${isPaused ? 'bg-tertiary' : 'bg-primary-container'}`}
            style={{ width: `${investigation.progress}%` }}
          ></div>
        </div>
      </section>

      {/* Mobile 3-Column Tab Switcher (Visible on small screens) */}
      <div className="lg:hidden px-space-md pt-space-sm max-w-[1720px] mx-auto w-full">
        <div className="grid grid-cols-3 gap-1 bg-surface-card p-1 rounded-lg border border-border-subtle shadow-xs">
          <button
            type="button"
            onClick={() => setMobileActiveCol('plan')}
            className={`py-1.5 px-2 text-xs font-semibold rounded transition-colors text-center ${
              mobileActiveCol === 'plan' ? 'bg-primary text-on-primary shadow-xs font-bold' : 'text-text-muted hover:text-dark-surface'
            }`}
          >
            Plan (Stage 4/6)
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveCol('stream')}
            className={`py-1.5 px-2 text-xs font-semibold rounded transition-colors text-center ${
              mobileActiveCol === 'stream' ? 'bg-primary text-on-primary shadow-xs font-bold' : 'text-text-muted hover:text-dark-surface'
            }`}
          >
            Agent Stream
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveCol('sources')}
            className={`py-1.5 px-2 text-xs font-semibold rounded transition-colors text-center ${
              mobileActiveCol === 'sources' ? 'bg-primary text-on-primary shadow-xs font-bold' : 'text-text-muted hover:text-dark-surface'
            }`}
          >
            Sources ({sources.length})
          </button>
        </div>
      </div>

      {/* Main 3-Column Investigative Layout */}
      <div className="p-space-md lg:p-space-lg grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start max-w-[1720px] mx-auto w-full">
        {/* ========================================== */}
        {/* COLUMN 1: RESEARCH PLAN & OUTLINE (Left 3 cols) */}
        {/* ========================================== */}
        <section className={`lg:col-span-3 flex-col gap-space-md ${mobileActiveCol === 'plan' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Plan Execution Card */}
          <div className="bg-surface-card rounded-lg p-space-md shadow-sm border border-border-subtle">
            <div className="flex items-center justify-between pb-3 mb-3 bg-surface-canvas/60 -mx-space-md -mt-space-md p-space-md rounded-t-lg border-b border-border-subtle">
              <div>
                <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted">
                  Workflow Protocol
                </div>
                <h2 className="font-headline-sm text-headline-sm text-dark-surface font-semibold">
                  RESEARCH EXECUTION PLAN
                </h2>
              </div>
              <span className="font-citation-ref text-citation-ref px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-bold">
                STAGE 4 OF 6
              </span>
            </div>

            {/* Vertical Plan Steps */}
            <ol className="space-y-space-md relative before:absolute before:left-3 before:top-2 before:bottom-3 before:w-0.5 before:bg-surface-container">
              {steps.map((step) => {
                const isComplete = step.status === 'COMPLETE';
                const isRunning = step.status === 'RUNNING';
                const isQueued = step.status === 'QUEUED';

                return (
                  <li
                    key={step.stepNumber}
                    className={`relative flex items-start gap-3 pl-1 group ${
                      isRunning ? 'bg-brand-tint/60 -mx-2 p-2 rounded-lg border border-primary/20' : ''
                    } ${isQueued ? 'opacity-75' : ''}`}
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-xs ${
                        isComplete
                          ? 'bg-secondary-container text-on-secondary-container font-bold'
                          : isRunning
                          ? 'bg-primary text-on-primary animate-spin'
                          : 'bg-surface-container text-text-muted'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px] font-bold">
                        {isComplete ? 'check' : isRunning ? 'sync' : 'radio_button_unchecked'}
                      </span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-body-compact text-body-compact ${
                            isRunning ? 'font-bold text-primary' : 'font-semibold text-dark-surface'
                          }`}
                        >
                          {step.title}
                        </span>
                        <span
                          className={`font-label-code text-citation-ref px-1 rounded font-bold ${
                            isComplete
                              ? 'text-secondary'
                              : isRunning
                              ? 'bg-primary-fixed text-on-primary-fixed'
                              : 'text-text-muted'
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>
                      <p className="font-micro-meta text-body-compact text-text-muted mt-0.5 leading-snug">
                        {step.description}
                      </p>
                      {step.detail && isRunning && (
                        <div className="mt-2 flex items-center gap-1.5 text-text-muted font-label-code text-citation-ref">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                          <span>{step.detail}</span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Plan Summary Card */}
          <div className="bg-surface-card rounded-lg p-space-md shadow-sm border border-border-subtle space-y-space-sm">
            <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted">
              Target Investigation Parameters
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-body-compact text-body-compact">
              <div className="bg-surface-canvas p-2 rounded border border-border-subtle">
                <div className="text-text-muted text-micro-meta font-micro-meta uppercase">Target City</div>
                <div className="font-semibold text-dark-surface mt-0.5">{investigation.city}</div>
              </div>
              <div className="bg-surface-canvas p-2 rounded border border-border-subtle">
                <div className="text-text-muted text-micro-meta font-micro-meta uppercase">Method</div>
                <div className="font-semibold text-dark-surface mt-0.5 truncate" title="Mixed Multi-Source Correlation">
                  Mixed Correlation
                </div>
              </div>
              <div className="bg-surface-canvas p-2 rounded border border-border-subtle">
                <div className="text-text-muted text-micro-meta font-micro-meta uppercase">Rigor Tier</div>
                <div className="font-semibold text-secondary mt-0.5">{investigation.rigorTier}</div>
              </div>
              <div className="bg-surface-canvas p-2 rounded border border-border-subtle">
                <div className="text-text-muted text-micro-meta font-micro-meta uppercase">Spatial Unit</div>
                <div className="font-semibold text-dark-surface mt-0.5">{investigation.spatialUnit}</div>
              </div>
            </div>
          </div>

          {/* Spatial Focus Snapshot with hotlinked map */}
          <div className="bg-surface-card rounded-lg p-space-md shadow-sm border border-border-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold">
                Active Spatial Focus
              </span>
              <span className="font-label-code text-citation-ref text-primary font-bold">
                Ward 14–29 Cluster
              </span>
            </div>
            <div
              className="w-full h-36 bg-cover bg-center rounded-lg relative overflow-hidden shadow-inner flex flex-col justify-end p-2.5 border border-border-subtle"
              style={{ backgroundImage: `url('${ASSETS.eastDelhiMap}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/90 via-dark-surface/30 to-transparent"></div>
              <div className="relative z-10 text-on-primary">
                <div className="font-label-code text-citation-ref text-secondary-fixed font-bold">
                  GPS FLEET DENSITY: -34.2% DEFICIT
                </div>
                <div className="font-body-compact text-body-compact font-semibold truncate">
                  Anand Vihar – Mayur Vihar Trans-Yamuna Corridor
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* COLUMN 2: LIVE AGENTS WORKFLOW STREAM (Center 5 cols) */}
        {/* ========================================== */}
        <section className={`lg:col-span-5 flex-col gap-space-md ${mobileActiveCol === 'stream' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="bg-surface-card rounded-lg p-space-md shadow-sm border border-border-subtle">
            <div className="flex items-center justify-between pb-3 bg-surface-canvas/60 -mx-space-md -mt-space-md p-space-md rounded-t-lg border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">psychology</span>
                <div>
                  <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted">
                    Real-Time Autonomous Pipeline
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-dark-surface font-semibold">
                    AGENT WORKFLOW STREAM
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-citation-ref text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  Platform data
                </span>
                <span className="flex items-center gap-1.5 font-label-code text-citation-ref bg-surface-container px-2 py-1 rounded text-primary font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  SYNC: 240ms
                </span>
              </div>
            </div>

            {/* Live Intelligence Stream Logs */}
            <div className="space-y-space-md pt-2">
              {agentLogs.map((log) => (
                <article
                  key={log.id}
                  className={`bg-surface-canvas rounded-lg p-3.5 transition-all hover:bg-surface-container-low border border-border-subtle/80 ${
                    log.confidenceScore ? 'bg-secondary-container/30 border-secondary/20' : ''
                  } ${log.highlightCitations ? 'ring-1 ring-primary/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded flex items-center justify-center font-label-code text-citation-ref font-bold ${log.badgeBg} ${log.badgeText}`}>
                        {log.agentCode}
                      </span>
                      <span className="font-body-compact text-body-compact font-semibold text-dark-surface">
                        {log.agentName}
                      </span>
                    </div>
                    <time className="font-label-code text-citation-ref text-text-muted">
                      {log.timestamp}
                    </time>
                  </div>

                  <p className="font-body-default text-body-default text-text-body leading-relaxed">
                    {/* Render message with interactive citation pills */}
                    {log.id === 'log-2' ? (
                      <>
                        Extracted Pages 42–47 of Delhi Transport Dept Operational Review 2024{' '}
                        <CitationQuickGlance
                          identifier="SRC-01"
                          source={sources.find(s => s.identifier === 'SRC-01')}
                          onInspectFullCitation={() => onInspectCitation('SRC-01')}
                        />
                        . Identified explicit finding:{' '}
                        <span className="italic font-medium text-dark-surface">
                          "Peak hour fleet deficit in North-East sector reached 34.2% due to unassigned depot transfers."
                        </span>
                      </>
                    ) : log.id === 'log-4' ? (
                      <>
                        Synthesized <span className="font-semibold text-dark-surface">Cross-Source Finding #01</span>: Population growth (+22%) in East Delhi peripheral wards coincides with 18% bus cancellation rate and 14,820 commuter grievance tickets. Discrepancy confirmed by CAG Audit Page 112{' '}
                        <CitationQuickGlance
                          identifier="SRC-03"
                          source={sources.find(s => s.identifier === 'SRC-03')}
                          onInspectFullCitation={() => onInspectCitation('SRC-03')}
                        />
                        .
                      </>
                    ) : (
                      log.message
                    )}
                  </p>

                  {/* Sparkline metric visual for Data Analysis agent */}
                  {log.stat && (
                    <div className="mt-3 bg-surface-card p-2.5 rounded border border-border-subtle flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-micro-meta text-micro-meta uppercase text-text-muted font-bold">
                          {log.stat.label}
                        </div>
                        <div className="font-headline-sm text-headline-sm text-dark-surface font-bold">
                          {log.stat.value}
                        </div>
                      </div>
                      <svg className="h-8 w-40 text-primary-container" fill="none" viewBox="0 0 160 32">
                        <path
                          d="M 0 28 Q 20 22 40 25 T 80 18 T 120 10 T 160 4"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="2.5"
                        ></path>
                        <circle cx="160" cy="4" fill="#2563EB" r="3"></circle>
                      </svg>
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 flex items-center justify-between text-micro-meta font-label-code text-text-muted border-t border-border-subtle/50">
                    <span className="bg-surface-card px-1.5 py-0.5 rounded text-primary font-medium border border-border-subtle/60">
                      {log.task}
                    </span>
                    <span>{log.latency}</span>
                  </div>
                </article>
              ))}
            </div>

            {/* Live Active Execution Status Bar */}
            <div className="mt-space-md p-3 rounded-lg bg-brand-tint/70 border border-primary/20 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-label-code text-citation-ref uppercase tracking-wider text-primary font-bold">
                  {isPaused ? 'Execution Suspended by User' : 'Live Execution Running'}
                </div>
                <p className="font-body-compact text-body-compact text-dark-surface truncate">
                  Data Analysis Agent is now evaluating contractor weighbridge logs for Finding #02...
                </p>
              </div>
              <span className="font-label-code text-citation-ref text-text-muted bg-surface-card px-2 py-1 rounded border border-border-subtle">
                AG-04
              </span>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* COLUMN 3: SOURCES & ACTIVE EVIDENCE (Right 4 cols) */}
        {/* ========================================== */}
        <section className={`lg:col-span-4 flex-col gap-space-md ${mobileActiveCol === 'sources' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="bg-surface-card rounded-lg p-space-md shadow-sm border border-border-subtle">
            {/* Header & Category Filters */}
            <div className="pb-3 bg-surface-canvas/60 -mx-space-md -mt-space-md p-space-md rounded-t-lg space-y-2.5 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted">
                    Ground Truth Repository
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-dark-surface font-semibold">
                    ACTIVE SOURCES ({sources.length} Verified)
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-citation-ref text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    Platform data
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('sources-and-datasets')}
                    className="text-primary hover:text-brand-hover text-micro-meta font-citation-ref font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                    FILTER
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['All', 'Govt Reports', 'Datasets', 'Audits'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSourceFilter(cat)}
                    className={`px-2.5 py-1 rounded text-citation-ref font-citation-ref transition-colors cursor-pointer shrink-0 ${
                      sourceFilter === cat
                        ? 'font-bold bg-primary text-on-primary'
                        : 'font-medium bg-surface-canvas hover:bg-surface-container text-text-body border border-border-subtle'
                    }`}
                  >
                    {cat === 'All' ? `All (${sources.length})` : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Cards List */}
            <div className="space-y-3 pt-2">
              {filteredSources.map((source) => {
                const isTargetHighlighted = highlightedSource === source.identifier;
                return (
                  <article
                    key={source.id}
                    id={`source-card-${source.identifier}`}
                    className={`p-3 rounded-lg transition-all relative border border-border-subtle space-y-2 ${
                      isTargetHighlighted
                        ? 'ring-2 ring-primary-container bg-brand-tint'
                        : 'bg-surface-canvas hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CitationQuickGlance
                          identifier={source.identifier}
                          source={source}
                          onInspectFullCitation={() => onInspectCitation(source.identifier)}
                        />
                        <span className="font-micro-meta text-micro-meta px-1.5 py-0.5 rounded bg-surface-container text-dark-surface font-semibold uppercase">
                          {source.category}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-citation-ref text-citation-ref text-secondary font-bold shrink-0">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        {source.reliabilityTier}
                      </span>
                    </div>

                    <h3 className="font-body-compact text-body-compact font-bold text-dark-surface leading-tight">
                      {source.title}
                    </h3>
                    <p className="font-micro-meta text-body-compact text-text-muted leading-snug">
                      {source.summary}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-micro-meta font-label-code text-text-muted border-t border-border-subtle/50">
                      <span>{source.citedPages}</span>
                      <span className="text-primary font-semibold">
                        {source.findingsLinkedCount} Findings Linked
                      </span>
                    </div>

                    {/* Smart Summary and Citation Inspector */}
                    <div className="pt-2 border-t border-border-subtle/50 flex items-center justify-between gap-2 flex-wrap">
                      <SmartSummary
                        title={source.title}
                        content={`${source.title}. ${source.summary}. Verbatim Excerpt: ${source.verbatimExcerpt}`}
                        publisher={source.meta}
                        category={source.category}
                        sourceId={source.id}
                        compact={true}
                      />
                      <button
                        type="button"
                        onClick={() => onInspectCitation(source.identifier)}
                        className="flex items-center gap-1 py-1 px-2 rounded bg-surface-card hover:bg-primary hover:text-on-primary text-text-body font-citation-ref text-citation-ref transition-colors shadow-2xs font-semibold border border-border-subtle cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px]">visibility</span>
                        <span>Inspect Full</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
