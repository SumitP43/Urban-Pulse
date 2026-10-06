import React, { useState } from 'react';
import { CausalNode, Source, Finding, NavigationPath } from '../types';
import { CAUSAL_NODES } from '../data/mockData';
import { CitationQuickGlance } from '../components/CitationQuickGlance';

interface CrossSourceAnalysisViewProps {
  sources: Source[];
  findings: Finding[];
  onInspectCitation: (sourceId: string) => void;
  onOpenExport: () => void;
  onNavigate?: (path: NavigationPath) => void;
}

export const CrossSourceAnalysisView: React.FC<CrossSourceAnalysisViewProps> = ({
  sources,
  findings,
  onInspectCitation,
  onOpenExport,
  onNavigate
}) => {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(3); // Node 3 is active target by default
  const [activeTab, setActiveTab] = useState<'scatter' | 'wards' | 'residuals'>('scatter');
  const [selectedFindingCode, setSelectedFindingCode] = useState<string>('finding-1');
  const [showFindingDropdown, setShowFindingDropdown] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ name: string; deficit: string; complaints: string } | null>(null);

  const findingOptions = [
    { id: 'finding-1', label: 'Finding #01: Peripheral Bus Transit Deficit' },
    { id: 'finding-2', label: 'Finding #02: Solid Waste Clearance Turnover' },
    { id: 'finding-3', label: 'Finding #03: Arterial Drainage Certification Lags' }
  ];

  const currentFindingOption = findingOptions.find(f => f.id === selectedFindingCode) || findingOptions[0];

  return (
    <div className="flex flex-col w-full">
      <div className="p-space-lg space-y-space-lg max-w-[1720px] mx-auto w-full">
        {/* Top Action Breadcrumb & Finding Bar */}
        <div className="bg-surface-card rounded-xl shadow-sm p-space-lg flex flex-col xl:flex-row xl:items-center justify-between gap-space-md border border-border-subtle">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-citation-ref text-citation-ref uppercase tracking-wider text-primary font-bold px-2 py-0.5 rounded bg-brand-tint border border-primary/20">
                METHODOLOGY: EMPIRICAL CAUSAL TRACING
              </span>
              <span className="text-text-muted font-micro-meta text-micro-meta">•</span>
              <span className="font-micro-meta text-micro-meta text-text-muted uppercase tracking-wider">
                PIPELINE RUN ID: DTC-ND-2024-C88
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight">
              Cross-Source Relational Analysis
            </h1>
            <p className="font-body-default text-body-default text-text-muted max-w-4xl">
              Discovering structural root causes and verifying empirical findings by cross-auditing disparate government reports, spatial demographic shapefiles, and municipal grievance registries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm pt-2 xl:pt-0">
            {/* Active Finding Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFindingDropdown(!showFindingDropdown)}
                className="flex items-center justify-between gap-3 bg-surface-canvas hover:bg-surface-container-low px-3.5 py-2 rounded-lg text-left shadow-xs transition-colors min-w-[340px] border border-border-subtle cursor-pointer"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-micro-meta text-micro-meta text-text-muted uppercase font-bold">
                    Active Audited Finding
                  </span>
                  <span className="font-headline-sm text-body-medium text-dark-surface font-semibold truncate">
                    {currentFindingOption.label}
                  </span>
                </div>
                <span className="material-symbols-outlined text-text-muted text-[18px]">keyboard_arrow_down</span>
              </button>

              {showFindingDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-card border border-border-subtle rounded-lg shadow-xl overflow-hidden z-50">
                  {findingOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedFindingCode(opt.id);
                        setShowFindingDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-body-compact transition-colors flex items-center justify-between ${
                        selectedFindingCode === opt.id
                          ? 'bg-brand-tint text-primary font-semibold'
                          : 'text-dark-surface hover:bg-surface-canvas'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {selectedFindingCode === opt.id && (
                        <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Confidence Badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-surface-container-low shadow-xs border border-border-subtle">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
              </span>
              <div className="flex flex-col">
                <span className="font-citation-ref text-citation-ref text-secondary font-bold tracking-tight">
                  MULTI-SOURCE CORRELATED
                </span>
                <span className="font-micro-meta text-micro-meta text-text-muted">
                  4 Connected Sources • 96.8% Confidence
                </span>
              </div>
            </div>

            {onNavigate && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('knowledge-graph')}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-canvas hover:bg-surface-container border border-border-subtle text-xs font-bold text-dark-surface flex items-center gap-1 cursor-pointer transition-colors"
                  title="Explore full topological evidence mesh in Knowledge Graph"
                >
                  <span className="material-symbols-outlined text-[15px] text-primary">hub</span>
                  <span>Knowledge Graph</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('data-analysis')}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-canvas hover:bg-surface-container border border-border-subtle text-xs font-bold text-dark-surface flex items-center gap-1 cursor-pointer transition-colors"
                  title="Run Econometric & Spatial Regression in Data Analysis"
                >
                  <span className="material-symbols-outlined text-[15px] text-secondary">query_stats</span>
                  <span>Data Analysis</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onOpenExport}
              className="p-2 text-text-muted hover:text-dark-surface hover:bg-surface-canvas rounded-lg shadow-xs transition-colors border border-border-subtle cursor-pointer"
              title="Export Citation Ledger"
            >
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
            </button>
          </div>
        </div>

        {/* Causal Discovery Sequence: Horizontal Stepper/Node Flow */}
        <div className="bg-surface-card rounded-xl shadow-sm p-space-lg space-y-space-md border border-border-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">timeline</span>
                <h2 className="font-headline-md text-headline-md text-dark-surface tracking-tight">
                  Causal Discovery Chain
                </h2>
              </div>
              <p className="font-body-compact text-body-compact text-text-muted mt-0.5">
                Stepwise progression from baseline demographic GIS expansion to certified municipal service failure.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-code text-label-code text-text-muted">CORRELATION CONTINUUM:</span>
              <span className="px-2 py-0.5 rounded font-label-code text-label-code bg-secondary-container text-on-secondary-container font-semibold">
                EMPIRICALLY PROVEN
              </span>
            </div>
          </div>

          {/* 5-Node Interactive Grid Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 relative">
            {CAUSAL_NODES.map((node) => {
              const isSelected = selectedNodeIndex === node.stageNumber;
              const isBottleneck = node.type === 'bottleneck';
              const isImpact = node.type === 'impact';
              const isSynthesis = node.type === 'synthesis';

              return (
                <div
                  key={node.stageNumber}
                  onClick={() => setSelectedNodeIndex(node.stageNumber)}
                  className={`group rounded-xl p-space-md flex flex-col justify-between transition-all cursor-pointer relative border ${
                    isSelected
                      ? isBottleneck
                        ? 'bg-surface-card ring-2 ring-critical-red shadow-md border-transparent'
                        : isImpact
                        ? 'bg-surface-card ring-2 ring-tertiary shadow-md border-transparent'
                        : isSynthesis
                        ? 'bg-surface-container-low ring-2 ring-secondary shadow-md border-transparent'
                        : 'bg-surface-card ring-2 ring-primary shadow-md border-transparent'
                      : 'bg-surface-canvas hover:bg-surface-container-low border-border-subtle shadow-xs'
                  }`}
                >
                  <div className="space-y-space-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-citation-ref text-citation-ref uppercase ${
                        isBottleneck ? 'text-critical-red font-semibold' : isImpact ? 'text-tertiary font-semibold' : isSynthesis ? 'text-secondary font-bold' : 'text-text-muted'
                      }`}>
                        {node.stageName}
                      </span>
                      <CitationQuickGlance
                        identifier={node.sourceTag.replace('[', '').replace(']', '')}
                        label={node.sourceTag}
                        source={sources.find(s => s.id === node.sourceTag.replace('[', '').replace(']', '') || s.identifier === node.sourceTag.replace('[', '').replace(']', ''))}
                        onInspectFullCitation={onInspectCitation}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className={`material-symbols-outlined text-[18px] ${
                        isBottleneck ? 'text-critical-red' : isImpact ? 'text-tertiary' : isSynthesis ? 'text-secondary' : 'text-domain-water'
                      }`}>
                        {node.type === 'demographic' ? 'layers' : node.type === 'demand' ? 'directions_bus' : node.type === 'bottleneck' ? 'error_outline' : node.type === 'impact' ? 'record_voice_over' : 'verified'}
                      </span>
                      <span className="font-body-medium text-body-medium font-bold text-dark-surface">
                        {node.title}
                      </span>
                    </div>

                    <div className="font-micro-meta text-micro-meta text-text-muted uppercase">
                      {node.subtitle}
                    </div>

                    <div className="pt-2">
                      <div className={`font-display-hero text-headline-lg tracking-tight ${
                        isBottleneck ? 'text-critical-red' : isImpact ? 'text-tertiary' : isSynthesis ? 'text-secondary font-bold' : 'text-primary'
                      }`}>
                        {node.metric}
                      </div>
                      <div className="font-body-compact text-body-compact text-text-body font-medium mt-0.5">
                        {node.metricDesc}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 flex items-center justify-between border-t border-border-subtle/50">
                    <span className="font-label-code text-label-code text-text-muted truncate">
                      {node.referenceDoc}
                    </span>
                    <span className={`material-symbols-outlined text-[16px] ${
                      isBottleneck ? 'text-critical-red' : isImpact ? 'text-tertiary' : isSynthesis ? 'text-secondary' : 'text-primary'
                    }`}>
                      {isBottleneck ? 'compare_arrows' : isSynthesis ? 'task_alt' : 'arrow_forward'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Investigative Workspace: 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left Panel: Empirical Correlation Deep Dive (Nodes 3 vs 4) */}
          <div className="lg:col-span-7 bg-surface-card rounded-xl shadow-sm p-space-lg space-y-space-md border border-border-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-xs gap-space-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-label-code text-label-code uppercase tracking-wider text-primary font-bold">
                    CORRELATION MATRIX
                  </span>
                  <span className="px-2 py-0.5 rounded text-micro-meta font-micro-meta bg-brand-tint text-primary font-bold">
                    NODE 03 ⇄ NODE 04
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-dark-surface mt-1">
                  Operational Fleet Allotment Deficit vs. Citizen Grievance Density
                </h3>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-canvas p-1 rounded-lg border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setActiveTab('scatter')}
                  className={`px-2.5 py-1 text-body-compact font-body-compact rounded font-medium cursor-pointer transition-colors ${
                    activeTab === 'scatter'
                      ? 'bg-surface-card text-dark-surface shadow-xs font-semibold'
                      : 'text-text-muted hover:text-dark-surface'
                  }`}
                >
                  Scatter Reg
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('wards')}
                  className={`px-2.5 py-1 text-body-compact font-body-compact rounded font-medium cursor-pointer transition-colors ${
                    activeTab === 'wards'
                      ? 'bg-surface-card text-dark-surface shadow-xs font-semibold'
                      : 'text-text-muted hover:text-dark-surface'
                  }`}
                >
                  By Ward (48)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('residuals')}
                  className={`px-2.5 py-1 text-body-compact font-body-compact rounded font-medium cursor-pointer transition-colors ${
                    activeTab === 'residuals'
                      ? 'bg-surface-card text-dark-surface shadow-xs font-semibold'
                      : 'text-text-muted hover:text-dark-surface'
                  }`}
                >
                  Residuals
                </button>
              </div>
            </div>

            {/* Statistical Coefficient Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              <div className="p-space-sm bg-surface-canvas rounded-lg border border-border-subtle">
                <div className="font-micro-meta text-micro-meta text-text-muted uppercase">Pearson r</div>
                <div className="font-headline-md text-headline-md text-dark-surface font-bold mt-0.5">0.814</div>
                <div className="font-citation-ref text-citation-ref text-secondary font-medium mt-0.5">High Covariance</div>
              </div>
              <div className="p-space-sm bg-surface-canvas rounded-lg border border-border-subtle">
                <div className="font-micro-meta text-micro-meta text-text-muted uppercase">p-value</div>
                <div className="font-headline-md text-headline-md text-dark-surface font-bold mt-0.5">&lt; 0.001</div>
                <div className="font-citation-ref text-citation-ref text-secondary font-medium mt-0.5">Statistically Significant</div>
              </div>
              <div className="p-space-sm bg-surface-canvas rounded-lg border border-border-subtle">
                <div className="font-micro-meta text-micro-meta text-text-muted uppercase">Sample Size (N)</div>
                <div className="font-headline-md text-headline-md text-dark-surface font-bold mt-0.5">48 Wards</div>
                <div className="font-citation-ref text-citation-ref text-text-muted mt-0.5">East &amp; North-East</div>
              </div>
              <div className="p-space-sm bg-surface-canvas rounded-lg border border-border-subtle">
                <div className="font-micro-meta text-micro-meta text-text-muted uppercase">95% Conf. Interval</div>
                <div className="font-headline-md text-headline-md text-dark-surface font-bold mt-0.5">[0.72, 0.88]</div>
                <div className="font-citation-ref text-citation-ref text-text-muted mt-0.5">Standard Error: 0.041</div>
              </div>
            </div>

            {/* Empirical Scatterplot Visual */}
            <div className="p-space-md bg-surface-canvas rounded-xl relative border border-border-subtle">
              <div className="flex items-center justify-between text-body-compact font-body-compact text-text-muted mb-2">
                <span className="font-label-code text-label-code">Y: MCD 311 Public Bus Complaints (per 10k Residents)</span>
                <span className="font-label-code text-label-code">X: Fleet Deficit % vs Sanctioned Depot Roster</span>
              </div>

              {/* Inline Responsive SVG Scatterplot */}
              <div className="w-full h-56 flex items-center justify-center relative">
                <svg className="w-full h-full text-border-strong select-none overflow-visible" viewBox="0 0 700 220">
                  {/* Grid lines */}
                  <line opacity="0.4" stroke="currentColor" strokeDasharray="3 3" x1="50" x2="680" y1="20" y2="20"></line>
                  <line opacity="0.4" stroke="currentColor" strokeDasharray="3 3" x1="50" x2="680" y1="70" y2="70"></line>
                  <line opacity="0.4" stroke="currentColor" strokeDasharray="3 3" x1="50" x2="680" y1="120" y2="120"></line>
                  <line opacity="0.4" stroke="currentColor" strokeDasharray="3 3" x1="50" x2="680" y1="170" y2="170"></line>
                  <line opacity="0.8" stroke="currentColor" x1="50" x2="680" y1="190" y2="190"></line>

                  {/* Axes and Labels */}
                  <line opacity="0.8" stroke="currentColor" x1="50" x2="50" y1="20" y2="190"></line>
                  <text className="text-[10px] fill-current text-text-muted font-mono" textAnchor="end" x="40" y="25">180</text>
                  <text className="text-[10px] fill-current text-text-muted font-mono" textAnchor="end" x="40" y="75">120</text>
                  <text className="text-[10px] fill-current text-text-muted font-mono" textAnchor="end" x="40" y="125">60</text>
                  <text className="text-[10px] fill-current text-text-muted font-mono" textAnchor="end" x="40" y="175">10</text>

                  <text className="text-[10px] fill-current text-text-muted font-mono" textAnchor="middle" x="70" y="208">5%</text>
                  <text className="text-[10px] fill-current text-text-muted font-mono" textAnchor="middle" x="210" y="208">15%</text>
                  <text className="text-[10px] fill-current text-text-muted font-mono" textAnchor="middle" x="350" y="208">25%</text>
                  <text className="text-[10px] fill-current text-text-muted font-mono" textAnchor="middle" x="490" y="208">35%</text>
                  <text className="text-[10px] fill-current text-text-muted font-mono" textAnchor="middle" x="630" y="208">45%</text>

                  {/* Regression Area Confidence Band */}
                  <polygon fill="#2563eb" fillOpacity="0.08" points="50,185 680,48 680,22 50,165"></polygon>
                  {/* Regression Trendline */}
                  <line stroke="#2563eb" strokeWidth="2.5" x1="50" x2="680" y1="175" y2="35"></line>

                  {/* Regular Scatter points (East Delhi Wards) */}
                  {[
                    { cx: 90, cy: 165, r: 4.5, name: 'Ward 14', def: '7%', comp: '22' },
                    { cx: 120, cy: 158, r: 4.5, name: 'Ward 18', def: '9%', comp: '28' },
                    { cx: 150, cy: 148, r: 4.5, name: 'Ward 21', def: '11%', comp: '36' },
                    { cx: 210, cy: 142, r: 5, name: 'Ward 26', def: '15%', comp: '44' },
                    { cx: 240, cy: 130, r: 4.5, name: 'Ward 33', def: '17%', comp: '52' },
                    { cx: 280, cy: 120, r: 4.5, name: 'Ward 40', def: '20%', comp: '64' },
                    { cx: 310, cy: 115, r: 5.5, name: 'Ward 42', def: '22%', comp: '70' },
                    { cx: 340, cy: 98, r: 4.5, name: 'Ward 49', def: '24%', comp: '84' },
                    { cx: 390, cy: 92, r: 4.5, name: 'Ward 53', def: '28%', comp: '92' },
                    { cx: 430, cy: 74, r: 5, name: 'Ward 61', def: '31%', comp: '110' },
                    { cx: 480, cy: 65, r: 5.5, name: 'Ward 72', def: '35%', comp: '124' }
                  ].map((p, i) => (
                    <circle
                      key={i}
                      cx={p.cx}
                      cy={p.cy}
                      r={p.r}
                      fill="#2563eb"
                      className="cursor-pointer transition-all hover:scale-150"
                      onMouseEnter={() => setHoveredPoint({ name: p.name, deficit: p.def, complaints: `${p.comp} per 10k` })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}

                  {/* Highlighted Outliers */}
                  <circle
                    cx="560"
                    cy="46"
                    fill="#dc2626"
                    r="7"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all hover:scale-150"
                    onMouseEnter={() => setHoveredPoint({ name: 'Seelampur (Ward 228)', deficit: '41.2%', complaints: '172 per 10k' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <text className="text-[11px] font-bold fill-current text-dark-surface font-sans" x="575" y="44">
                    Seelampur (Ward 228)
                  </text>
                  <text className="text-[10px] fill-current text-text-muted font-sans" x="575" y="58">
                    Deficit: 41.2% • 172 Grievances/10k
                  </text>

                  <circle
                    cx="610"
                    cy="38"
                    fill="#dc2626"
                    r="6.5"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all hover:scale-150"
                    onMouseEnter={() => setHoveredPoint({ name: 'Mustafabad (Ward 241)', deficit: '43.8%', complaints: '184 per 10k' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <text className="text-[10px] font-bold fill-current text-dark-surface font-sans" x="618" y="28">
                    Mustafabad (Ward 241)
                  </text>
                </svg>

                {hoveredPoint && (
                  <div className="absolute top-2 right-2 bg-dark-surface text-on-primary text-xs p-2 rounded shadow-lg pointer-events-none font-mono">
                    <div className="font-bold text-white">{hoveredPoint.name}</div>
                    <div className="text-secondary-fixed">Fleet Deficit: {hoveredPoint.deficit}</div>
                    <div className="text-slate-300">Complaints: {hoveredPoint.complaints}</div>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-body-compact font-body-compact text-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-critical-red"></span>
                  Peripheral Critical Clusters (East/North-East)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                  Regular Ward Observations (N=48)
                </span>
              </div>
            </div>

            {/* Synthesis Summary Footer */}
            <div className="bg-surface-canvas p-space-md rounded-lg flex items-start gap-space-sm border border-border-subtle">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">psychology</span>
              <div className="space-y-1">
                <span className="font-body-medium text-body-medium font-semibold text-dark-surface">
                  Relational Finding Deduction
                </span>
                <p className="font-body-compact text-body-compact text-text-body">
                  The strong linear correlation (<span className="font-label-code text-label-code font-bold">r = 0.814</span>) confirms that 311 commuter grievances in peripheral clusters are directly driven by depot route unassignments (<CitationQuickGlance identifier="SRC-01" label="[SRC-01]" source={sources.find(s => s.id === 'SRC-01')} onInspectFullCitation={onInspectCitation} />), rejecting the hypothesis that delays were merely caused by temporary road traffic congestion.
                </p>
                <div className="flex items-center justify-end pt-1">
                  <span className="font-citation-ref text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">Platform data</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Primary Evidentiary Inspector */}
          <div className="lg:col-span-5 flex flex-col space-y-space-md">
            {/* Excerpt Card 1: DoT Annual Review */}
            <div className="bg-surface-card rounded-xl shadow-sm p-space-lg space-y-space-sm relative border border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-citation-ref text-citation-ref px-2 py-0.5 rounded bg-error-container text-on-error-container font-bold">
                    [SRC-01]
                  </span>
                  <span className="font-body-compact text-body-compact font-bold text-dark-surface">
                    Delhi Transport Dept Review (2024)
                  </span>
                </div>
                <span className="font-label-code text-label-code text-text-muted">PDF • Page 44</span>
              </div>

              <div className="p-space-md bg-surface-canvas rounded-lg space-y-2 border border-border-subtle">
                <div className="flex items-center justify-between text-micro-meta font-micro-meta text-text-muted">
                  <span className="uppercase">VERIFIED AUDIT EXCERPT</span>
                  <span className="flex items-center gap-1 text-secondary font-bold">
                    <span className="material-symbols-outlined text-[14px]">verified</span> EXACT MATCH (SHA-256)
                  </span>
                </div>
                <p className="font-body-compact text-body-compact text-dark-surface italic leading-relaxed">
                  "...despite passenger load factors exceeding <mark className="bg-amber-100 text-dark-surface px-1 py-0.5 rounded font-semibold">142% of rated capacity</mark> in Eastern periphery sectors (Anand Vihar, Seelampur, Nand Nagri corridors), <mark className="bg-rose-100 text-critical-red px-1 py-0.5 rounded font-semibold">a chronic 34.2% fleet deficit persists</mark> due to delays in assigning depot berths at Ghaddoli and Nand Nagri terminal depots..."
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-label-code text-label-code text-text-muted">Extracted by: DocumentExtractorAgent-v2</span>
                <button
                  type="button"
                  onClick={() => onInspectCitation('SRC-01')}
                  className="font-label-code text-label-code text-primary hover:text-brand-hover font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Inspect Source PDF</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </button>
              </div>
            </div>

            {/* Excerpt Card 2: CAG Audit Report */}
            <div className="bg-surface-card rounded-xl shadow-sm p-space-lg space-y-space-sm relative border border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-citation-ref text-citation-ref px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold">
                    [SRC-03]
                  </span>
                  <span className="font-body-compact text-body-compact font-bold text-dark-surface">
                    CAG Performance Audit on NCT Mobility
                  </span>
                </div>
                <span className="font-label-code text-label-code text-text-muted">Govt Audit • Page 112</span>
              </div>

              <div className="p-space-md bg-surface-canvas rounded-lg space-y-2 border border-border-subtle">
                <div className="flex items-center justify-between text-micro-meta font-micro-meta text-text-muted">
                  <span className="uppercase">OFFICIAL STATUTORY VALIDATION</span>
                  <span className="flex items-center gap-1 text-secondary font-bold">
                    <span className="material-symbols-outlined text-[14px]">shield_with_heart</span> TIER-1 INDEPENDENT AUDIT
                  </span>
                </div>
                <p className="font-body-compact text-body-compact text-dark-surface italic leading-relaxed">
                  "Audit scrutiny of fleet log registers revealed that <mark className="bg-emerald-100 text-dark-surface px-1 py-0.5 rounded font-semibold">operational scheduled trips failed to materialize in 38 of 48 surveyed peripheral routes</mark>. The operational failure aligns directly with citizen grievances documented in the municipal 311 ticketing records..."
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-label-code text-label-code text-text-muted">Verified by: StatutoryAuditorCrossCheck</span>
                <button
                  type="button"
                  onClick={() => onInspectCitation('SRC-03')}
                  className="font-label-code text-label-code text-primary hover:text-brand-hover font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View CAG Record</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </button>
              </div>
            </div>

            {/* Corroboration Pipeline Summary Box */}
            <div className="bg-surface-card rounded-xl shadow-sm p-space-md flex items-center justify-between border border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">hub</span>
                </div>
                <div>
                  <div className="font-headline-sm text-body-medium font-bold text-dark-surface">
                    Evidence Cohesion Score
                  </div>
                  <div className="font-body-compact text-body-compact text-text-muted">
                    Triangulated across 4 distinct institutional jurisdictions
                  </div>
                </div>
              </div>
              <span className="font-display-hero text-headline-md text-secondary font-bold">
                98.4 / 100
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Source Provenance Comparison Table */}
        <div className="bg-surface-card rounded-xl shadow-sm p-space-lg space-y-space-md border border-border-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <h3 className="font-headline-md text-headline-md text-dark-surface tracking-tight">
                Multi-Source Provenance &amp; Lineage Registry
              </h3>
              <p className="font-body-compact text-body-compact text-text-muted mt-0.5">
                Authoritative catalog of all datasets ingested and corroborated for Finding #01.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenExport}
                className="px-3 py-1.5 rounded-lg bg-surface-canvas hover:bg-surface-container-low text-text-body font-body-compact text-body-compact font-medium transition-colors flex items-center gap-1.5 shadow-xs border border-border-subtle cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Export Citation Ledger</span>
              </button>
            </div>
          </div>

          {/* Provenance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-default text-body-default">
              <thead>
                <tr className="bg-surface-canvas text-text-muted font-micro-meta text-micro-meta uppercase tracking-wider border-b border-border-subtle">
                  <th className="py-3 px-space-md rounded-l-lg">Source Identifier &amp; Name</th>
                  <th className="py-3 px-space-md">Document Type</th>
                  <th className="py-3 px-space-md">Publication Date</th>
                  <th className="py-3 px-space-md">Reliability Tier</th>
                  <th className="py-3 px-space-md">Key Extracted Metric</th>
                  <th className="py-3 px-space-md rounded-r-lg">Verification Role</th>
                </tr>
              </thead>
              <tbody className="text-dark-surface divide-y divide-border-subtle">
                {sources.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-canvas/60 transition-colors">
                    <td className="py-3 px-space-md">
                      <div className="flex items-center gap-2">
                        <CitationQuickGlance
                          identifier={s.identifier}
                          label={`[${s.identifier}]`}
                          source={s}
                          onInspectFullCitation={onInspectCitation}
                        />
                        <div className="flex flex-col">
                          <span className="font-body-medium text-body-medium font-semibold text-dark-surface">
                            {s.title}
                          </span>
                          <span className="font-micro-meta text-micro-meta text-text-muted">
                            {s.meta}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-space-md">
                      <span className="font-label-code text-label-code px-2 py-0.5 rounded bg-surface-canvas text-text-body border border-border-subtle">
                        {s.documentType}
                      </span>
                    </td>
                    <td className="py-3 px-space-md font-label-code text-label-code text-text-muted">
                      {s.identifier === 'SRC-01' ? 'June 2024' : s.identifier === 'SRC-02' ? 'Oct 2024' : s.identifier === 'SRC-03' ? 'Jan 2025' : s.identifier === 'SRC-04' ? '2024 Revision' : 'Q2-Q3 2024'}
                    </td>
                    <td className="py-3 px-space-md">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-citation-ref font-citation-ref font-bold bg-secondary-container text-on-secondary-container">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> {s.reliabilityTier}
                      </span>
                    </td>
                    <td className="py-3 px-space-md">
                      <div className="font-label-code text-label-code font-bold text-critical-red">
                        {s.keyExtractedMetric?.metric || '34.2% Deficit'}
                      </div>
                      <div className="font-micro-meta text-micro-meta text-text-muted">
                        {s.keyExtractedMetric?.desc || 'Peripheral depot allocation'}
                      </div>
                    </td>
                    <td className="py-3 px-space-md">
                      <span className="font-body-compact text-body-compact text-primary font-medium">
                        {s.verificationRole || 'Primary Empirical Driver'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
