import React, { useState } from 'react';
import { Investigation, NavigationPath } from '../types';

interface OverviewDashboardViewProps {
  investigations: Investigation[];
  onNavigate: (path: NavigationPath) => void;
  onOpenNewResearch: () => void;
  onSelectInvestigation: (inv: Investigation) => void;
  onInspectCitation: (sourceId: string) => void;
  onLaunchWebSearch?: (query: string) => void;
}

export const OverviewDashboardView: React.FC<OverviewDashboardViewProps> = ({
  investigations,
  onNavigate,
  onOpenNewResearch,
  onSelectInvestigation,
  onInspectCitation,
  onLaunchWebSearch
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const filteredInvestigations = selectedDomain === 'all'
    ? investigations
    : investigations.filter(i => i.domain === selectedDomain);

  const handleRunSearch = () => {
    if (promptInput.trim() && onLaunchWebSearch) {
      onLaunchWebSearch(promptInput.trim());
    } else {
      onNavigate('web-intelligence');
    }
  };

  const handleStarterClick = (query: string) => {
    setPromptInput(query);
    if (onLaunchWebSearch) {
      onLaunchWebSearch(query);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Command Quick-Start Ribbon */}
      <div className="px-space-lg pt-space-lg pb-space-md max-w-7xl mx-auto w-full">
        <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full pointer-events-none blur-2xl"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-md relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brand-tint border border-primary/20 text-primary">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span className="font-citation-ref text-citation-ref uppercase font-bold tracking-wider">
                  EVIDENCE-BACKED AUTONOMOUS DISCOVERY PLATFORM
                </span>
              </div>
              <h1 className="font-display-hero text-display-hero text-dark-surface tracking-tight mt-2">
                Discover What Urban Data Is Hiding.
              </h1>
              <p className="font-body-lg text-body-lg text-text-muted max-w-3xl">
                UrbanResearch AI analyzes government reports, public datasets, municipal documents, complaint records, and research sources to uncover evidence-backed urban problems with strict citation traceability.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm shrink-0 self-start md:self-center">
              <button
                type="button"
                onClick={onOpenNewResearch}
                className="flex items-center gap-2 bg-primary-container hover:bg-brand-hover text-on-primary px-space-md py-2.5 rounded-lg font-body-medium text-body-medium shadow-sm transition-all transform active:translate-y-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Start New Research</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('research-history')}
                className="flex items-center gap-2 bg-surface-canvas hover:bg-surface-card border border-border-strong text-text-body hover:text-dark-surface px-space-md py-2.5 rounded-lg font-body-medium text-body-medium transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">history</span>
                <span>Explore Previous Research</span>
              </button>
            </div>
          </div>

          {/* Autonomous Agent Interactive Prompt Field */}
          <div className="relative z-10 mt-space-md bg-surface-canvas rounded-lg p-2 border border-border-subtle shadow-inner">
            <form
              className="flex flex-col lg:flex-row gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleRunSearch();
              }}
            >
              <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-surface-card rounded border border-border-subtle focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary/15 transition-all">
                <span className="material-symbols-outlined text-primary text-[20px]">search_insights</span>
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Ask an urban research question or paste a public dataset URL..."
                  className="w-full bg-transparent font-body-default text-body-default text-dark-surface placeholder:text-text-muted outline-none"
                />
                <span className="font-label-code text-label-code text-text-muted px-2 py-0.5 rounded bg-surface-canvas border border-border-subtle hidden sm:inline-block">
                  CSV / PDF / 311 API
                </span>
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-dark-surface hover:bg-black text-on-primary px-5 py-2.5 rounded font-body-medium text-body-medium transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary-fixed">auto_mode</span>
                <span>Run Autonomous Research</span>
              </button>
            </form>

            {/* Template Query Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 px-1 text-text-muted">
              <span className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-body font-bold">
                Investigation Starters:
              </span>
              <button
                type="button"
                onClick={() => handleStarterClick('Bus Fleet Distribution vs DTC Peak Overcrowding in East Delhi')}
                className="text-xs bg-surface-card hover:bg-surface-container-high border border-border-subtle text-text-body px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">directions_bus</span>
                <span>Bus Fleet vs Overcrowding</span>
              </button>
              <button
                type="button"
                onClick={() => handleStarterClick('Solid Waste Collection Gaps & Overflow Hotspots in MCD 311 Logs')}
                className="text-xs bg-surface-card hover:bg-surface-container-high border border-border-subtle text-text-body px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px] text-tertiary">delete</span>
                <span>Solid Waste Collection Gaps</span>
              </button>
              <button
                type="button"
                onClick={() => handleStarterClick('DJB Water Pipeline Distribution Inequity vs Tanker Dispatch Volume')}
                className="text-xs bg-surface-card hover:bg-surface-container-high border border-border-subtle text-text-body px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px] text-domain-water">water_drop</span>
                <span>Water Pipeline Distribution Inequity</span>
              </button>
            </div>
          </div>

          {/* Trust Metrics Strip */}
          <div className="mt-space-md pt-space-sm border-t border-border-subtle flex flex-wrap items-center justify-between gap-y-2 text-text-muted font-label-code text-label-code">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
              <span className="font-semibold text-dark-surface">1,420+</span> Government Sources Indexed
            </div>
            <div className="hidden sm:inline-block text-border-strong">•</div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">dataset</span>
              <span className="font-semibold text-dark-surface">84</span> Public Datasets
            </div>
            <div className="hidden sm:inline-block text-border-strong">•</div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-provenance-purple">fact_check</span>
              <span className="font-semibold text-dark-surface">100%</span> Citation Backed
            </div>
            <div className="hidden sm:inline-block text-border-strong">•</div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">account_balance</span>
              <span>CAG & MCD Audits Verified</span>
            </div>
          </div>

          {/* Live Alert Center Ticker Bar */}
          <div 
            onClick={() => onNavigate('alert-center')}
            className="mt-3 p-2.5 sm:p-3 bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center justify-between gap-3 cursor-pointer hover:bg-red-100/60 dark:hover:bg-red-950/30 transition-colors group"
            title="Click to open Civic Alert Center & Grievance Logs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-critical-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-critical-red"></span>
              </span>
              <span className="font-citation-ref text-[10.5px] font-bold text-critical-red uppercase tracking-wider shrink-0">
                LIVE 311 ALERTS:
              </span>
              <span className="text-xs text-dark-surface font-medium truncate">
                GRAP Stage-IV Emergency Enacted &amp; 38 Active Civic Grievance Logs Ingested
              </span>
            </div>
            <div className="flex items-center gap-1 font-citation-ref text-xs text-primary font-bold shrink-0 group-hover:underline">
              <span>Alert Center</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key System Metrics Row (4 KPI Cards) */}
      <div className="px-space-lg py-space-sm max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1 */}
          <div className="bg-surface-card p-space-md rounded-lg border border-border-subtle shadow-sm hover:border-border-strong transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold">
                  Investigation Scope
                </span>
                <span className="material-symbols-outlined text-[18px] text-primary">travel_explore</span>
              </div>
              <div className="font-display-hero text-[30px] font-extrabold text-dark-surface leading-tight">14 Active</div>
              <p className="font-body-compact text-body-compact text-text-body mt-1">Across 4 major municipal zones</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 font-label-code text-citation-ref text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Delhi, Mumbai, BLR, MAA</span>
              </div>
              <span className="font-citation-ref text-citation-ref text-primary font-bold">42 LIVE TASKS</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-card p-space-md rounded-lg border border-border-subtle shadow-sm hover:border-border-strong transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold">
                  Traceable Discoveries
                </span>
                <span className="material-symbols-outlined text-[18px] text-secondary">insights</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display-hero text-[30px] font-extrabold text-dark-surface leading-tight">142</span>
                <span className="font-citation-ref text-citation-ref text-secondary font-bold bg-secondary-container/40 px-1.5 py-0.5 rounded">
                  +18 this mo
                </span>
              </div>
              <p className="font-body-compact text-body-compact text-text-body mt-1">Verified problem discoveries across audits</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="font-label-code text-citation-ref text-text-muted">Provenance standard</span>
              <span className="font-citation-ref text-citation-ref text-secondary font-bold">100% TRACEABLE</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-card p-space-md rounded-lg border border-border-subtle shadow-sm hover:border-border-strong transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold">
                  Grievance Telemetry
                </span>
                <span className="material-symbols-outlined text-[18px] text-tertiary">record_voice_over</span>
              </div>
              <div className="font-display-hero text-[30px] font-extrabold text-dark-surface leading-tight">12.4M</div>
              <p className="font-body-compact text-body-compact text-text-body mt-1">Ingested civic municipal complaint tickets</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="font-label-code text-citation-ref text-text-muted">MCD 311 • PGMS • MoHUA</span>
              <span className="font-citation-ref text-citation-ref text-text-body font-semibold">SYNCED HOURLY</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-card p-space-md rounded-lg border border-border-subtle shadow-sm hover:border-border-strong transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold">
                  Cross-Validation Rate
                </span>
                <span className="material-symbols-outlined text-[18px] text-primary-container">rule</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display-hero text-[30px] font-extrabold text-dark-surface leading-tight">94.2%</span>
                <span className="font-citation-ref text-citation-ref text-primary font-bold">HIGH</span>
              </div>
              <p className="font-body-compact text-body-compact text-text-body mt-1">Corroborated across disconnected systems</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="font-label-code text-citation-ref text-text-muted">Avg. Density</span>
              <span className="font-citation-ref text-citation-ref text-dark-surface font-bold">3.4 SOURCES/FINDING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Research Investigations Section */}
      <div className="px-space-lg py-space-md max-w-7xl mx-auto w-full">
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md border-b border-border-subtle pb-space-sm">
          <div className="flex items-center gap-3">
            <h2 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight">
              Recent Research Investigations
            </h2>
            <span className="font-label-code text-citation-ref bg-surface-container-high text-primary px-2 py-0.5 rounded font-bold">
              {filteredInvestigations.length} PINNED
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-0.5 bg-surface-canvas rounded-lg border border-border-subtle text-xs">
              {['all', 'transportation', 'waste', 'water', 'health'].map((dom) => (
                <button
                  key={dom}
                  type="button"
                  onClick={() => setSelectedDomain(dom)}
                  className={`px-3 py-1.5 rounded transition-colors cursor-pointer capitalize ${
                    selectedDomain === dom
                      ? 'bg-surface-card text-dark-surface font-semibold shadow-xs'
                      : 'text-text-muted hover:text-dark-surface font-medium'
                  }`}
                >
                  {dom === 'all' ? 'All Domains' : dom}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onNavigate('research-history')}
              className="inline-flex items-center gap-1 font-body-compact text-body-compact font-semibold text-primary hover:text-brand-hover px-2 py-1 rounded cursor-pointer"
            >
              <span>View All Archive (14)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          {filteredInvestigations.map((inv) => (
            <article
              key={inv.id}
              className="bg-surface-card rounded-lg border border-border-subtle hover:border-primary-container hover:shadow-md transition-all flex flex-col justify-between p-space-lg"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-start justify-between gap-3 mb-space-sm">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-citation-ref text-citation-ref px-2 py-0.5 rounded bg-brand-tint border border-primary/20 text-primary font-bold">
                        {inv.city}
                      </span>
                      <span className="font-citation-ref text-citation-ref px-2 py-0.5 rounded bg-surface-container text-text-body font-medium">
                        {inv.domainLabel}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-dark-surface tracking-tight font-bold pt-1">
                      {inv.title}
                    </h3>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed/30 border border-secondary text-on-secondary-fixed-variant font-citation-ref text-citation-ref font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      {inv.status === 'completed' ? 'Verified & Complete' : 'Live Execution (75%)'}
                    </span>
                  </div>
                </div>

                {/* Summary & Citations */}
                <div className="space-y-2 mt-space-sm">
                  <p className="font-body-default text-body-default text-text-body leading-relaxed">
                    {inv.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-label-code text-text-muted pt-1 flex-wrap">
                    <span className="material-symbols-outlined text-[16px] text-provenance-purple">link</span>
                    <span>Citations:</span>
                    {inv.citations.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onInspectCitation(c)}
                        className="text-primary hover:underline cursor-pointer font-citation-ref font-semibold"
                      >
                        [{c}]
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metrics Highlight Strip */}
                <div className="grid grid-cols-3 gap-2 my-space-md py-2.5 px-3 bg-surface-canvas rounded border border-border-subtle font-label-code text-xs">
                  <div>
                    <div className="text-text-muted text-[10px] uppercase font-bold">Source Depth</div>
                    <div className="text-dark-surface font-semibold mt-0.5">{inv.sourceDepth} Sources</div>
                    <div className="text-[10px] text-text-muted truncate">{inv.sourceList}</div>
                  </div>
                  <div>
                    <div className="text-text-muted text-[10px] uppercase font-bold">Key Findings</div>
                    <div className="text-dark-surface font-semibold mt-0.5">{inv.keyFindingsCount} Verified</div>
                    <div className="text-[10px] text-secondary font-semibold">{inv.highStrengthCount} High Strength</div>
                  </div>
                  <div>
                    <div className="text-text-muted text-[10px] uppercase font-bold">Audit Chronology</div>
                    <div className="text-dark-surface font-semibold mt-0.5">{inv.auditDate}</div>
                    <div className="text-[10px] text-text-muted">{inv.updatedAgo}</div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-space-sm border-t border-border-subtle flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectInvestigation(inv);
                      onNavigate('research-workspace');
                    }}
                    className="px-3 py-1.5 rounded bg-primary-container hover:bg-brand-hover text-on-primary font-body-compact text-body-compact font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Open Workspace</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectInvestigation(inv);
                      onNavigate('discoveries-and-findings');
                    }}
                    className="px-3 py-1.5 rounded border border-border-strong text-text-body hover:bg-surface-canvas font-body-compact text-body-compact font-medium transition-colors cursor-pointer"
                  >
                    View {inv.keyFindingsCount} Findings
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('cross-source-analysis')}
                  className="p-1.5 text-text-muted hover:text-dark-surface hover:bg-surface-canvas rounded transition-colors cursor-pointer"
                  title="Inspect Citation Map"
                >
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Autonomous Research Multi-Agent Pipeline Status Bar */}
      <div className="px-space-lg pt-space-sm pb-space-xl max-w-7xl mx-auto w-full">
        <div className="bg-surface-card rounded-lg border border-border-subtle p-space-md shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container"></span>
              </span>
              <span className="font-headline-sm text-headline-sm text-dark-surface font-bold">
                Autonomous Research Agent Workers
              </span>
              <span className="font-citation-ref text-citation-ref px-2 py-0.5 rounded bg-surface-canvas text-text-muted font-bold border border-border-subtle">
                CLUSTER 04-DELHI
              </span>
            </div>
            <div className="font-label-code text-label-code text-text-muted flex items-center gap-2">
              <span>Active Query:</span>
              <span className="text-primary font-mono font-medium truncate max-w-md">
                "Correlating DTC Route #543 delays with Najafgarh drain overflow reports"
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-xs">
            <div className="flex items-center gap-2.5 p-2 rounded bg-surface-canvas border border-border-subtle">
              <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
              <div className="min-w-0">
                <div className="font-semibold text-dark-surface">Doc Ingestion</div>
                <div className="text-text-muted truncate">318 pages scanned</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded bg-surface-canvas border border-border-subtle">
              <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
              <div className="min-w-0">
                <div className="font-semibold text-dark-surface">Audit Reconciliation</div>
                <div className="text-text-muted truncate">CAG Table 4.2 normalized</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded bg-brand-tint border border-primary/30">
              <span className="material-symbols-outlined text-[18px] text-primary animate-spin">sync</span>
              <div className="min-w-0">
                <div className="font-semibold text-primary">Cross-Source Synthesis</div>
                <div className="text-primary/80 truncate">Calculating correlation index...</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded bg-surface-canvas border border-border-subtle opacity-70">
              <span className="material-symbols-outlined text-[18px] text-text-muted">pending</span>
              <div className="min-w-0">
                <div className="font-semibold text-dark-surface">Citation Verification</div>
                <div className="text-text-muted truncate">Pending synthesis matrix</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
