import React, { useState } from 'react';
import { Finding, NavigationPath, Source } from '../types';
import { ASSETS } from '../data/mockData';
import { SmartSummary } from '../components/SmartSummary';
import { CitationQuickGlance } from '../components/CitationQuickGlance';
import { DataOriginBadge } from '../components/DataOriginBadge';

interface DiscoveriesFindingsViewProps {
  findings: Finding[];
  sources: Source[];
  onNavigate: (path: NavigationPath) => void;
  onInspectCitation: (sourceId: string) => void;
  onOpenExport: () => void;
}

export const DiscoveriesFindingsView: React.FC<DiscoveriesFindingsViewProps> = ({
  findings,
  sources,
  onNavigate,
  onInspectCitation,
  onOpenExport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeInspectorSourceId, setActiveInspectorSourceId] = useState<string>('src-1');
  const [finalReportList, setFinalReportList] = useState<string[]>(['finding-1']);
  const [reScanRunning, setReScanRunning] = useState(false);

  const activeSource = sources.find(s => s.id === activeInspectorSourceId) || sources[0];

  const handleToggleReport = (findingId: string) => {
    if (finalReportList.includes(findingId)) {
      setFinalReportList(finalReportList.filter(id => id !== findingId));
    } else {
      setFinalReportList([...finalReportList, findingId]);
    }
  };

  const handleTriggerReScan = () => {
    setReScanRunning(true);
    setTimeout(() => {
      setReScanRunning(false);
    }, 1800);
  };

  const filteredFindings = findings.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.narrative.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.affectedWards.some(w => w.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === 'high') return f.evidenceStrength === 'HIGH';
    if (selectedFilter === 'transportation') return f.domain === 'transportation';
    if (selectedFilter === 'waste') return f.domain === 'waste';
    if (selectedFilter === 'water') return f.domain === 'water';
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      {/* Investigation Header & Action Hub */}
      <div className="w-full bg-surface-card px-space-lg lg:px-space-xl py-space-lg shadow-sm border-b border-border-subtle">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
          {/* Top Meta & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-citation-ref text-citation-ref px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold tracking-wider">
                  CIVIC RECON-7 // SYNTHESIS STAGE
                </span>
                <span className="font-micro-meta text-micro-meta text-text-muted uppercase tracking-wider">
                  Audit Protocol NCT-D24
                </span>
                <span className="font-citation-ref text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                  Platform data
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight">
                Discovered Urban Problems &amp; Findings
              </h1>
              <p className="font-body-default text-text-muted max-w-3xl">
                Evidence-backed problem discoveries extracted from cross-referencing government reports, public grievance logs, and municipal datasets with cryptographic citation anchoring.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={onOpenExport}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-canvas hover:bg-surface-container text-text-body font-body-compact text-body-compact font-semibold shadow-xs transition-colors border border-border-subtle cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-text-muted">download</span>
                <span>Export Findings Summary (PDF/JSON)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('research-reports')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container hover:bg-brand-hover text-on-primary font-body-medium text-body-medium font-semibold shadow-sm transition-transform active:translate-y-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                <span>Synthesize Final Report ({finalReportList.length})</span>
              </button>
            </div>
          </div>

          {/* Live Search & Filtering Strip */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm pt-space-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-muted">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discovered problems, ward locations, or keywords..."
                className="w-full bg-surface-canvas text-dark-surface placeholder:text-text-muted pl-9 pr-10 py-2 rounded-lg font-body-default text-body-default focus:outline-none focus:ring-2 focus:ring-primary shadow-xs transition-all border border-border-subtle"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-label-code text-label-code text-text-muted px-1.5 py-0.5 bg-surface-card rounded shadow-xs border border-border-subtle">
                ⌘K
              </kbd>
            </div>

            {/* Filter Pills & Sorting */}
            <div className="flex items-center gap-space-sm overflow-x-auto pb-1 md:pb-0">
              <div className="flex items-center gap-1.5 bg-surface-canvas p-1 rounded-lg border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1 rounded font-body-compact text-body-compact cursor-pointer transition-colors ${
                    selectedFilter === 'all'
                      ? 'bg-surface-card font-semibold text-primary shadow-xs'
                      : 'text-text-body font-medium hover:bg-surface-card/60'
                  }`}
                >
                  All Findings (8)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('high')}
                  className={`px-3 py-1 rounded font-body-compact text-body-compact cursor-pointer transition-colors ${
                    selectedFilter === 'high'
                      ? 'bg-surface-card font-semibold text-primary shadow-xs'
                      : 'text-text-body font-medium hover:bg-surface-card/60'
                  }`}
                >
                  High Strength (6)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('transportation')}
                  className={`px-3 py-1 rounded font-body-compact text-body-compact cursor-pointer transition-colors ${
                    selectedFilter === 'transportation'
                      ? 'bg-surface-card font-semibold text-primary shadow-xs'
                      : 'text-text-body font-medium hover:bg-surface-card/60'
                  }`}
                >
                  Transportation (4)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('waste')}
                  className={`px-3 py-1 rounded font-body-compact text-body-compact cursor-pointer transition-colors ${
                    selectedFilter === 'waste'
                      ? 'bg-surface-card font-semibold text-primary shadow-xs'
                      : 'text-text-body font-medium hover:bg-surface-card/60'
                  }`}
                >
                  Waste (2)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('water')}
                  className={`px-3 py-1 rounded font-body-compact text-body-compact cursor-pointer transition-colors ${
                    selectedFilter === 'water'
                      ? 'bg-surface-card font-semibold text-primary shadow-xs'
                      : 'text-text-body font-medium hover:bg-surface-card/60'
                  }`}
                >
                  Water (2)
                </button>
              </div>

              <div className="h-6 w-px bg-border-subtle"></div>

              <div className="flex items-center gap-1.5 bg-surface-canvas px-2.5 py-1.5 rounded-lg text-text-muted font-body-compact text-body-compact border border-border-subtle">
                <span className="material-symbols-outlined text-[16px]">swap_vert</span>
                <span className="text-dark-surface font-semibold">Evidence Strength:</span>
                <span>Highest First</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Workspace Content */}
      <div className="w-full px-space-lg lg:px-space-xl py-space-lg">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Findings Stack (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-space-md">
            {/* Banner Metric Summary Card */}
            <div className="bg-surface-card rounded-xl p-space-md shadow-xs flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 border border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div>
                  <div className="font-headline-sm text-headline-sm text-dark-surface">
                    6 High-Confidence Corroborated Theses
                  </div>
                  <div className="font-body-compact text-body-compact text-text-muted">
                    32 Distinct archival datasets cross-referenced against 18,940 geotagged citizen tickets.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-citation-ref text-citation-ref bg-surface-container text-primary font-bold px-2 py-1 rounded">
                  ALGORITHM V3.4.1
                </span>
                <span className="font-citation-ref text-citation-ref bg-secondary-fixed/40 text-on-secondary-fixed-variant font-bold px-2 py-1 rounded">
                  AUDIT TRAIL SECURE
                </span>
              </div>
            </div>

            {/* Findings List */}
            {filteredFindings.map((finding) => {
              const isInReport = finalReportList.includes(finding.id);

              return (
                <article
                  key={finding.id}
                  className="bg-surface-card rounded-xl p-space-lg shadow-sm space-y-space-md transition-shadow hover:shadow-md border border-border-subtle"
                >
                  {/* Card Header & Strength */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-citation-ref text-citation-ref font-bold bg-brand-tint text-primary px-2 py-0.5 rounded">
                        {finding.findingNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 font-citation-ref text-citation-ref font-bold px-2 py-0.5 rounded ${
                          finding.evidenceStrength === 'HIGH'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {finding.evidenceStrength === 'HIGH' ? 'check_circle' : 'schedule'}
                        </span>
                        <span>EVIDENCE STRENGTH: {finding.evidenceStrength}</span>
                      </span>
                      <span className="font-citation-ref text-citation-ref text-text-muted font-semibold">
                        CONFIDENCE {finding.confidence}%
                      </span>
                      <DataOriginBadge origin="DERIVED" compact />
                    </div>
                    <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">policy</span>
                      <span>{finding.sourceCountLabel}</span>
                    </div>
                  </div>

                  {/* Problem Headline */}
                  <h2 className="font-headline-md text-headline-md text-dark-surface tracking-tight leading-snug">
                    {finding.title}
                  </h2>

                  {/* Evidence Narrative with Interactive Citations */}
                  <div className="bg-surface-canvas rounded-lg p-space-md space-y-space-xs text-text-body font-body-default text-body-default leading-relaxed border border-border-subtle">
                    <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">psychology</span>
                      <span>Autonomous Synthesized Narrative</span>
                    </div>
                    <p>
                      {/* Render text with interactive citation badges with Quick-Glance Tooltips */}
                      {finding.id === 'finding-1' ? (
                        <>
                          Cross-referencing DTC bus route schedules with MCD 311 commuter grievance logs reveals a 34.2% operational fleet deficit during morning peak hours (08:00–10:30) in North-East and East Delhi wards, despite a 22% population increase in these wards since 2018{' '}
                          <CitationQuickGlance
                            source={sources.find((s) => s.id === 'src-1')}
                            identifier="SRC-01"
                            label="[1]"
                            onInspectFullCitation={(id) => {
                              setActiveInspectorSourceId('src-1');
                              onInspectCitation('SRC-01');
                            }}
                          />{' '}
                          <CitationQuickGlance
                            source={sources.find((s) => s.id === 'src-3')}
                            identifier="SRC-03"
                            label="[3]"
                            onInspectFullCitation={(id) => {
                              setActiveInspectorSourceId('src-3');
                              onInspectCitation('SRC-03');
                            }}
                          />
                          . CAG audit logs confirm unassigned depot transfers as the root mechanical driver{' '}
                          <CitationQuickGlance
                            source={sources.find((s) => s.id === 'src-3')}
                            identifier="SRC-03"
                            label="[3]"
                            onInspectFullCitation={(id) => {
                              setActiveInspectorSourceId('src-3');
                              onInspectCitation('SRC-03');
                            }}
                          />
                          .
                        </>
                      ) : finding.id === 'finding-2' ? (
                        <>
                          Combining municipal weighbridge dispatch ledgers with 311 sanitation tickets indicates an unresolved complaint rate of 42% in Ward 27 during Q3, matching a 28% drop in contractor collection vehicles documented in the municipal financial audit{' '}
                          <CitationQuickGlance
                            source={sources.find((s) => s.id === 'src-2')}
                            identifier="SRC-02"
                            label="[2]"
                            onInspectFullCitation={(id) => {
                              setActiveInspectorSourceId('src-2');
                              onInspectCitation('SRC-02');
                            }}
                          />
                          . Ghazipur transfer station logs register 1,420 unweighed night trips with zero manifest certification.
                        </>
                      ) : (
                        <>
                          Pre-monsoon drainage maintenance reports show formal desilting sign-offs lagged physical rain events by up to 54 calendar days across Ring Road nodes{' '}
                          <CitationQuickGlance
                            source={sources.find((s) => s.id === 'src-4')}
                            identifier="SRC-04"
                            label="[4]"
                            onInspectFullCitation={(id) => {
                              setActiveInspectorSourceId('src-4');
                              onInspectCitation('SRC-04');
                            }}
                          />
                          . Real-time traffic sensor speed telemetry dropped by 74% at these exact 18 chronic inundation points during moderate showers (&gt;15mm/hr){' '}
                          <CitationQuickGlance
                            source={sources.find((s) => s.id === 'src-5')}
                            identifier="SRC-05"
                            label="[5]"
                            onInspectFullCitation={(id) => {
                              setActiveInspectorSourceId('src-5');
                              onInspectCitation('SRC-05');
                            }}
                          />
                          .
                        </>
                      )}
                    </p>

                    {/* Integrated Smart Summary for Finding Card */}
                    <div className="pt-2 border-t border-border-subtle/50 flex items-center justify-between flex-wrap gap-2">
                      <SmartSummary
                        title={finding.title}
                        content={`${finding.title}. ${finding.narrative}`}
                        publisher="Autonomous Synthesized Thesis"
                        category={finding.domain}
                        sourceId={finding.id}
                        compact={true}
                      />
                      <span className="text-[10px] text-text-muted font-citation-ref">
                        Corroborated: {finding.sourceCountLabel || `${finding.citations.length} Sources`}
                      </span>
                    </div>
                  </div>

                  {/* Supporting Quantitative Metric Grid */}
                  <div className={`grid grid-cols-1 sm:grid-cols-${finding.metrics.length} gap-space-sm`}>
                    {finding.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-surface-canvas p-space-md rounded-lg space-y-1 border border-border-subtle">
                        <div
                          className={`font-micro-meta text-micro-meta uppercase tracking-wider font-bold flex items-center gap-1 ${
                            metric.type === 'deficit' || metric.type === 'alert'
                              ? 'text-critical-red'
                              : metric.type === 'correlation' || metric.type === 'verified'
                              ? 'text-secondary'
                              : 'text-text-muted'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {metric.type === 'deficit' ? 'trending_down' : metric.type === 'alert' ? 'warning' : 'analytics'}
                          </span>
                          <span>{metric.label}</span>
                        </div>
                        <div className="font-headline-lg text-headline-lg font-bold text-dark-surface tracking-tight">
                          {metric.value}
                        </div>
                        <div className="font-citation-ref text-citation-ref text-text-muted truncate">
                          {metric.source}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Affected Geographies Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body-compact text-body-compact text-text-muted font-medium">
                      Affected Wards:
                    </span>
                    {finding.affectedWards.map((w, idx) => (
                      <span
                        key={idx}
                        className="font-citation-ref text-citation-ref px-2 py-0.5 rounded-full bg-surface-container font-semibold text-dark-surface border border-border-subtle"
                      >
                        {w}
                      </span>
                    ))}
                  </div>

                  {/* Provenance Footbar Actions */}
                  <div className="pt-space-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm border-t border-border-subtle">
                    <div className="flex items-center gap-2 flex-wrap">
                      {finding.citations.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveInspectorSourceId(c.id);
                            onInspectCitation(c.id.replace('src-', 'SRC-0'));
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-surface-canvas hover:bg-surface-container font-label-code text-label-code text-primary font-semibold transition-colors cursor-pointer border border-border-subtle"
                        >
                          <span className="material-symbols-outlined text-[15px]">description</span>
                          <span>Inspect Citation {c.name}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => onNavigate('cross-source-analysis')}
                        className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-text-muted hover:text-dark-surface font-body-compact text-body-compact font-medium transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">account_tree</span>
                        <span>Logic Graph</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleReport(finding.id)}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-body-compact text-body-compact font-semibold shadow-xs transition-colors cursor-pointer ${
                        isInReport
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-primary-container hover:bg-brand-hover text-on-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isInReport ? 'bookmark_check' : 'bookmark_add'}
                      </span>
                      <span>{isInReport ? 'Added to Report' : 'Add to Final Report'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Real-Time Evidence & Citation Inspector Sidebar (4 cols on desktop) */}
          <aside className="lg:col-span-4 sticky top-20 space-y-space-md">
            {/* Live Inspector Panel Container */}
            <div className="bg-surface-card rounded-xl p-space-md shadow-sm space-y-space-md border border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">find_in_page</span>
                  <span className="font-headline-sm text-headline-sm text-dark-surface">
                    Evidence Inspector
                  </span>
                </div>
                <span className="font-citation-ref text-citation-ref bg-surface-container-high text-primary px-2 py-0.5 rounded font-bold">
                  ACTIVE: [{activeSource.identifier.replace('SRC-0', '').replace('SRC-', '')}]
                </span>
              </div>

              {/* Document Snippet Frame */}
              <div className="bg-surface-canvas rounded-lg p-space-md space-y-space-sm border border-border-subtle">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-body-medium text-body-medium font-bold text-dark-surface">
                      {activeSource.title}
                    </div>
                    <div className="font-citation-ref text-citation-ref text-text-muted">
                      {activeSource.meta}
                    </div>
                  </div>
                  <span className="font-citation-ref text-citation-ref text-secondary font-bold bg-secondary-fixed/30 px-1.5 py-0.5 rounded shrink-0">
                    OFFICIAL
                  </span>
                </div>

                {/* Page Excerpt */}
                <div className="bg-surface-card p-3 rounded text-text-body font-body-compact text-body-compact space-y-2 shadow-xs border border-border-subtle">
                  <div className="flex items-center justify-between text-text-muted font-micro-meta text-micro-meta uppercase tracking-wider">
                    <span>Excerpt: Section 4.3 (Depot Operational Allocation)</span>
                    <span>{activeSource.pageNumber}</span>
                  </div>
                  <p className="leading-relaxed bg-brand-tint/60 p-2 rounded text-dark-surface font-label-code text-label-code border border-primary/20">
                    {activeSource.verbatimExcerpt}
                  </p>
                </div>

                {/* Smart Summary of Source Document */}
                <div className="pt-2 border-t border-border-subtle/50">
                  <SmartSummary
                    title={activeSource.title}
                    content={activeSource.verbatimExcerpt || activeSource.summary || activeSource.title}
                    publisher={activeSource.meta}
                    category={activeSource.documentType}
                    sourceId={activeSource.id}
                    compact={true}
                  />
                </div>

                {/* Provenance & Hash */}
                <div className="pt-1 flex items-center justify-between font-citation-ref text-citation-ref text-text-muted">
                  <span>SHA256: {activeSource.sha256.substring(0, 10)}...d41b</span>
                  <button
                    type="button"
                    onClick={() => onInspectCitation(activeSource.identifier)}
                    className="text-primary font-medium hover:underline cursor-pointer"
                  >
                    Open Full Original PDF
                  </button>
                </div>
              </div>

              {/* Corroborating Spatial Layer Map View */}
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold">
                    Corroborating Spatial Layer
                  </span>
                  <span className="font-citation-ref text-citation-ref text-primary font-semibold">
                    NCT Delhi Ward Grid
                  </span>
                </div>
                <div
                  className="w-full h-44 rounded-lg bg-surface-canvas relative overflow-hidden flex flex-col justify-end p-space-sm shadow-xs border border-border-subtle bg-cover bg-center"
                  style={{ backgroundImage: `url('${ASSETS.shahdaraMap}')` }}
                >
                  <div className="bg-dark-surface/85 backdrop-blur-sm p-2 rounded text-on-primary space-y-0.5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-citation-ref text-citation-ref font-bold text-secondary-container">
                        SHUTTLE DEFICIT HOTSPOT
                      </span>
                      <span className="font-citation-ref text-citation-ref text-text-muted">
                        LAT 28.67 • LNG 77.29
                      </span>
                    </div>
                    <div className="font-body-compact text-body-compact truncate">
                      Shahdara South / Seelampur Corridor Sector 4
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Chain of Custody */}
              <div className="space-y-2">
                <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold">
                  Evidence Verification Chain
                </div>
                <div className="space-y-1.5 font-label-code text-label-code">
                  <div className="flex items-center justify-between p-2 rounded bg-surface-canvas border border-border-subtle">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-secondary">verified</span>
                      <span className="text-dark-surface font-semibold">[1] DTC Operational Review</span>
                    </div>
                    <span className="text-text-muted">p. 44</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-surface-canvas border border-border-subtle">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-secondary">verified</span>
                      <span className="text-dark-surface font-semibold">[2] MCD Auditor General FY24</span>
                    </div>
                    <span className="text-text-muted">p. 112</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-surface-canvas border border-border-subtle">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-secondary">verified</span>
                      <span className="text-dark-surface font-semibold">[3] CAG Audit on Capital Fleet</span>
                    </div>
                    <span className="text-text-muted">p. 89</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-surface-canvas border border-border-subtle">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-text-muted">pending</span>
                      <span className="text-text-body font-semibold">[4] PWD Culvert Maintenance Cert</span>
                    </div>
                    <span className="text-text-muted">p. 19</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleTriggerReScan}
                disabled={reScanRunning}
                className="w-full py-2 px-3 rounded-lg bg-surface-canvas hover:bg-surface-container font-body-compact text-body-compact text-dark-surface font-semibold flex items-center justify-center gap-2 transition-colors border border-border-subtle cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[16px] ${reScanRunning ? 'animate-spin text-primary' : ''}`}>
                  {reScanRunning ? 'sync' : 'rule'}
                </span>
                <span>
                  {reScanRunning ? 'Re-scanning 32 Datasets...' : 'Trigger Autonomous Verification Re-Scan'}
                </span>
              </button>
            </div>

            {/* Research Synthesis Method Note Box */}
            <div className="bg-surface-card rounded-xl p-space-md shadow-xs space-y-2 border border-border-subtle">
              <div className="flex items-center gap-2 text-dark-surface">
                <span className="material-symbols-outlined text-[18px] text-tertiary">info</span>
                <span className="font-headline-sm text-headline-sm">Research Synthesis Method</span>
              </div>
              <p className="font-body-compact text-body-compact text-text-muted leading-relaxed">
                All 8 findings are generated through autonomous entity-resolution algorithms that cross-verify grievance logs with budget outlays and statutory audits. Triangulation requires at least 2 disconnected institutional sources before elevation to "High Strength".
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
