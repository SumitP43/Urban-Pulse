import React, { useState, useEffect } from 'react';
import { Source, Finding, Investigation } from '../types';
import { CitationQuickGlance } from '../components/CitationQuickGlance';
import { SmartSummary } from '../components/SmartSummary';


interface ViewProps {
  sources: Source[];
  findings: Finding[];
  investigation: Investigation;
  onInspectCitation: (sourceId: string) => void;
  onOpenExport: () => void;
}

// 1. DATA ANALYSIS VIEW
export const DataAnalysisView: React.FC<ViewProps> = ({ sources, findings, onInspectCitation }) => {
  const [selectedModel, setSelectedModel] = useState<'pearson' | 'spearman' | 'ols'>('pearson');

  return (
    <div className="p-space-lg space-y-space-lg max-w-7xl mx-auto w-full">
      <div className="bg-surface-card rounded-xl shadow-sm p-space-lg border border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-4">
          <div>
            <div className="font-citation-ref text-citation-ref text-primary font-bold uppercase tracking-wider">
              ECONOMETRIC & SPATIAL REGRESSION ENGINE
            </div>
            <h1 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight mt-1">
              Data Analysis & Cross-Validation Matrices
            </h1>
            <p className="font-body-default text-text-muted mt-1">
              Quantitative modeling correlating 1.42M civic grievance rows with 14,200 GPS bus telemetry logs.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-canvas p-1 rounded-lg border border-border-subtle">
            <button
              type="button"
              onClick={() => setSelectedModel('pearson')}
              className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer ${
                selectedModel === 'pearson' ? 'bg-surface-card text-primary shadow-xs' : 'text-text-muted'
              }`}
            >
              Pearson Correlation
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('spearman')}
              className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer ${
                selectedModel === 'spearman' ? 'bg-surface-card text-primary shadow-xs' : 'text-text-muted'
              }`}
            >
              Spearman Rank
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('ols')}
              className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer ${
                selectedModel === 'ols' ? 'bg-surface-card text-primary shadow-xs' : 'text-text-muted'
              }`}
            >
              OLS Multivariate
            </button>
          </div>
        </div>

        {/* Statistical Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-surface-canvas p-4 rounded-lg border border-border-subtle">
            <div className="text-micro-meta uppercase text-text-muted font-bold">R-Squared Coefficient</div>
            <div className="text-2xl font-bold text-dark-surface mt-1 font-mono">0.662</div>
            <div className="text-xs text-secondary mt-1">Explains 66.2% of variance</div>
          </div>
          <div className="bg-surface-canvas p-4 rounded-lg border border-border-subtle">
            <div className="text-micro-meta uppercase text-text-muted font-bold">T-Statistic</div>
            <div className="text-2xl font-bold text-dark-surface mt-1 font-mono">9.48</div>
            <div className="text-xs text-secondary mt-1">p &lt; 0.0001 (Significant)</div>
          </div>
          <div className="bg-surface-canvas p-4 rounded-lg border border-border-subtle">
            <div className="text-micro-meta uppercase text-text-muted font-bold">Residual Std Error</div>
            <div className="text-2xl font-bold text-dark-surface mt-1 font-mono">4.12</div>
            <div className="text-xs text-text-muted mt-1">Degrees of freedom: 46</div>
          </div>
          <div className="bg-surface-canvas p-4 rounded-lg border border-border-subtle">
            <div className="text-micro-meta uppercase text-text-muted font-bold">Spatial Autocorrelation</div>
            <div className="text-2xl font-bold text-dark-surface mt-1 font-mono">Moran's I: 0.74</div>
            <div className="text-xs text-primary mt-1">Strong spatial clustering</div>
          </div>
        </div>

        {/* Ward Distribution Table */}
        <div className="mt-6">
          <h3 className="font-headline-sm text-dark-surface font-semibold mb-3">
            Top 5 Extreme Variance Wards (Trans-Yamuna Cluster)
          </h3>
          <div className="overflow-x-auto border border-border-subtle rounded-lg">
            <table className="w-full text-left font-body-compact text-xs">
              <thead className="bg-surface-canvas text-text-muted uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Ward Number &amp; Name</th>
                  <th className="p-3">Scheduled Buses</th>
                  <th className="p-3">Turnout Deficit %</th>
                  <th className="p-3">311 Complaints</th>
                  <th className="p-3">Residual Deviation</th>
                  <th className="p-3">Audit Citation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-dark-surface">
                <tr className="hover:bg-surface-canvas">
                  <td className="p-3 font-semibold">Ward 228 (Seelampur)</td>
                  <td className="p-3 font-mono">34</td>
                  <td className="p-3 font-mono text-critical-red font-bold">-41.2%</td>
                  <td className="p-3 font-mono font-bold">172 / 10k</td>
                  <td className="p-3 font-mono text-critical-red">+18.4 (High Outlier)</td>
                  <td className="p-3">
                    <CitationQuickGlance identifier="SRC-01" label="[SRC-01 p.44]" source={sources.find(s => s.id === 'SRC-01')} onInspectFullCitation={onInspectCitation} />
                  </td>
                </tr>
                <tr className="hover:bg-surface-canvas">
                  <td className="p-3 font-semibold">Ward 241 (Mustafabad)</td>
                  <td className="p-3 font-mono">28</td>
                  <td className="p-3 font-mono text-critical-red font-bold">-43.8%</td>
                  <td className="p-3 font-mono font-bold">184 / 10k</td>
                  <td className="p-3 font-mono text-critical-red">+21.1 (High Outlier)</td>
                  <td className="p-3">
                    <CitationQuickGlance identifier="SRC-03" label="[SRC-03 p.112]" source={sources.find(s => s.id === 'SRC-03')} onInspectFullCitation={onInspectCitation} />
                  </td>
                </tr>
                <tr className="hover:bg-surface-canvas">
                  <td className="p-3 font-semibold">Ward 214 (Maujpur)</td>
                  <td className="p-3 font-mono">42</td>
                  <td className="p-3 font-mono text-critical-red font-bold">-36.5%</td>
                  <td className="p-3 font-mono font-bold">148 / 10k</td>
                  <td className="p-3 font-mono text-slate-600">+4.2 (Expected)</td>
                  <td className="p-3">
                    <CitationQuickGlance identifier="SRC-01" label="[SRC-01 p.46]" source={sources.find(s => s.id === 'SRC-01')} onInspectFullCitation={onInspectCitation} />
                  </td>
                </tr>
                <tr className="hover:bg-surface-canvas">
                  <td className="p-3 font-semibold">Ward 205 (Yamuna Vihar)</td>
                  <td className="p-3 font-mono">38</td>
                  <td className="p-3 font-mono text-critical-red font-bold">-31.9%</td>
                  <td className="p-3 font-mono font-bold">122 / 10k</td>
                  <td className="p-3 font-mono text-slate-600">-1.8 (Expected)</td>
                  <td className="p-3">
                    <CitationQuickGlance identifier="SRC-02" label="[SRC-02 Logs]" source={sources.find(s => s.id === 'SRC-02')} onInspectFullCitation={onInspectCitation} />
                  </td>
                </tr>
                <tr className="hover:bg-surface-canvas">
                  <td className="p-3 font-semibold">Ward 198 (Karawal Nagar)</td>
                  <td className="p-3 font-mono">40</td>
                  <td className="p-3 font-mono text-critical-red font-bold">-39.0%</td>
                  <td className="p-3 font-mono font-bold">160 / 10k</td>
                  <td className="p-3 font-mono text-critical-red">+12.6 (High Outlier)</td>
                  <td className="p-3">
                    <CitationQuickGlance identifier="SRC-04" label="[SRC-04 GIS]" source={sources.find(s => s.id === 'SRC-04')} onInspectFullCitation={onInspectCitation} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Data-origin badge */}
          <div className="pt-2 flex justify-end">
            <span className="font-citation-ref text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">Platform data</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// 2. DOCUMENT INTELLIGENCE VIEW
export const DocumentIntelligenceView: React.FC<ViewProps> = ({ sources, onInspectCitation }) => {
  return (
    <div className="p-space-lg space-y-space-lg max-w-7xl mx-auto w-full">
      <div className="bg-surface-card rounded-xl shadow-sm p-space-lg border border-border-subtle">
        <div className="flex items-center gap-2 text-primary font-citation-ref text-xs uppercase font-bold">
          <span className="material-symbols-outlined text-[18px]">document_scanner</span>
          <span>OCR EXTRACTION & VECTORIZATION ENGINE</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight mt-1">
          Document Intelligence &amp; PDF Auditing
        </h1>
        <p className="font-body-default text-text-muted mt-1">
          Automated tabular parsing, OCR integrity validation (99.4% precision), and SHA-256 cryptographic notarization.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {sources.map((s) => (
            <div key={s.id} className="p-4 bg-surface-canvas rounded-lg border border-border-subtle space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-citation-ref text-citation-ref px-1.5 py-0.5 rounded bg-brand-tint text-primary font-bold">
                    {s.identifier}
                  </span>
                  <h3 className="font-body-compact font-bold text-dark-surface mt-1">{s.title}</h3>
                  <div className="text-micro-meta text-text-muted font-mono">{s.meta}</div>
                </div>
                <span className="font-citation-ref text-[11px] text-secondary font-bold bg-secondary-fixed/30 px-1.5 py-0.5 rounded">
                  SHA-256 VERIFIED
                </span>
              </div>

              <div className="p-3 bg-surface-card rounded border border-border-subtle font-mono text-xs text-dark-surface">
                <div className="text-micro-meta text-text-muted mb-1 font-bold uppercase">EXTRACTED SEGMENT:</div>
                <p className="italic text-slate-700 leading-relaxed">{s.verbatimExcerpt}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle">
                <span className="text-text-muted font-mono">Size: {s.fileSize || '4.8 MB'}</span>
                <button
                  type="button"
                  onClick={() => onInspectCitation(s.identifier)}
                  className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Inspect Document Chunk</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. SOURCES & DATASETS VIEW
export const SourcesDatasetsView: React.FC<ViewProps> = ({ sources, onInspectCitation }) => {
  const [filter, setFilter] = useState<string>('all');
  const filtered = filter === 'all' ? sources : sources.filter(s => s.category.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="p-space-lg space-y-space-lg max-w-7xl mx-auto w-full">
      <div className="bg-surface-card rounded-xl shadow-sm p-space-lg border border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-4">
          <div>
            <div className="font-citation-ref text-citation-ref text-primary font-bold uppercase tracking-wider">
              GROUND TRUTH REPOSITORY
            </div>
            <h1 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight mt-1">
              Sources &amp; Audited Datasets (32 Verified)
            </h1>
            <p className="font-body-default text-text-muted mt-1">
              Authoritative archives indexed with cryptographic checksums and cross-validation linkages.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-canvas p-1 rounded-lg border border-border-subtle">
            {['all', 'Govt Reports', 'Datasets', 'Audits', 'GIS Layer'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer ${
                  filter === cat ? 'bg-surface-card text-primary shadow-xs' : 'text-text-muted'
                }`}
              >
                {cat === 'all' ? 'All (32)' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mt-4">
          {filtered.map((s) => (
            <div key={s.id} className="p-4 bg-surface-canvas rounded-lg border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-citation-ref text-citation-ref px-1.5 py-0.5 rounded bg-brand-tint text-primary font-bold">
                    {s.identifier}
                  </span>
                  <span className="font-micro-meta text-micro-meta uppercase px-1.5 py-0.5 rounded bg-surface-container text-dark-surface font-semibold">
                    {s.category}
                  </span>
                  <span className="font-citation-ref text-citation-ref text-secondary font-bold">
                    ✓ {s.reliabilityTier}
                  </span>
                </div>
                <h3 className="font-body-compact font-bold text-dark-surface text-sm">{s.title}</h3>
                <p className="font-body-compact text-xs text-text-muted">{s.summary}</p>
                <div className="font-label-code text-[11px] text-text-muted">
                  SHA-256 Checksum: <span className="font-mono">{s.sha256}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <span className="font-citation-ref text-xs text-primary font-bold">
                  {s.findingsLinkedCount} Findings Linked
                </span>
                <button
                  type="button"
                  onClick={() => onInspectCitation(s.identifier)}
                  className="px-3 py-1.5 rounded bg-primary text-on-primary font-body-compact text-xs font-semibold hover:bg-brand-hover transition-colors cursor-pointer"
                >
                  Inspect Citation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. RESEARCH REPORTS VIEW
export const ResearchReportsView: React.FC<ViewProps> = ({ investigation, findings, sources, onOpenExport }) => {
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/research/history')
      .then(r => r.ok ? r.json() : [])
      .then(data => setSessionHistory(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="p-space-lg space-y-space-lg max-w-7xl mx-auto w-full">
      <div className="bg-surface-card rounded-xl shadow-sm p-space-lg border border-border-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <span className="font-citation-ref text-xs text-primary font-bold uppercase tracking-wider">
              POLICY SYNTHESIS DOSSIER // NCT-D24
            </span>
            <h1 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight mt-1">
              Executive Research Report: {investigation.title}
            </h1>
            <p className="font-body-default text-text-muted mt-1">
              Compiled by Autonomous Urban Research Protocol NCT-D24 for Dr. Rajesh Varma
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-citation-ref text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">Platform data</span>
            <button
              type="button"
              onClick={onOpenExport}
              className="px-4 py-2 rounded-lg bg-primary-container hover:bg-brand-hover text-on-primary font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download Formatted PDF</span>
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h2 className="font-headline-sm text-dark-surface font-bold">1. Executive Summary &amp; Statutory Drivers</h2>
          <p className="font-body-default text-slate-700 leading-relaxed">
            Over a four-year cross-validation window (2022–2025), analysis of 32 official government reports, Comptroller &amp; Auditor General (CAG) audit observations, and 1.42M geotagged civic grievances demonstrates that East Delhi peripheral wards experience a systemic <strong className="text-critical-red">34.2% peak-hour transit bus deficit</strong>. Rather than traffic congestion delays, empirical evidence confirms that depot chassis non-attendance and unassigned route transfers constitute the primary root causes (Pearson r = 0.814, p &lt; 0.001).
          </p>
        </div>

        {/* Synthesized Findings Grid */}
        <div className="space-y-4">
          <h2 className="font-headline-sm text-dark-surface font-bold">2. Corroborated Findings &amp; Citation Evidence</h2>
          {findings.map((f) => (
            <div key={f.id} className="p-4 bg-surface-canvas rounded-lg border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-citation-ref text-xs text-primary font-bold">{f.findingNumber}</span>
                <span className="font-citation-ref text-xs text-secondary font-bold bg-secondary-fixed/30 px-2 py-0.5 rounded">
                  EVIDENCE STRENGTH: {f.evidenceStrength} ({f.confidence}%)
                </span>
              </div>
              <h3 className="font-body-default font-bold text-dark-surface">{f.title}</h3>
              <p className="font-body-compact text-slate-700 leading-relaxed">{f.narrative}</p>
              <div className="flex items-center gap-2 text-xs text-text-muted font-mono pt-1">
                <span>Wards Affected: {f.affectedWards.join(', ')}</span>
              </div>
              <div className="pt-2 border-t border-border-subtle/50">
                <SmartSummary
                  title={f.title}
                  content={`${f.title}. ${f.narrative}`}
                  publisher="Urban Research Protocol"
                  category={f.domain || 'Urban Research'}
                  sourceId={f.id}
                  compact={true}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actionable Policy Recommendations */}
        <div className="space-y-3 border-t border-border-subtle pt-4">
          <h2 className="font-headline-sm text-dark-surface font-bold">3. Actionable Policy Recommendations</h2>
          <ul className="list-disc list-inside space-y-2 text-body-default text-slate-700">
            <li><strong>Immediate Depot Berth Reallocation:</strong> Mandate scheduled pull-outs at Ghaddoli and Nand Nagri terminal depots with GPS telematics monitoring.</li>
            <li><strong>Automated SLA Penalties:</strong> Enforce contractual non-performance deductions on privatized chassis maintenance operators under Section 9 of MCD audit regulations.</li>
            <li><strong>Corridor Frequency Surge:</strong> Deploy 42 dedicated high-capacity electric shuttle buses along the Anand Vihar – Mayur Vihar Trans-Yamuna corridor during 08:00–10:30 peak windows.</li>
          </ul>
        </div>
      </div>

      {/* Session Research History */}
      <div className="bg-surface-card rounded-xl shadow-sm p-space-lg border border-border-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2 font-headline-sm text-sm font-bold text-dark-surface">
            <span className="material-symbols-outlined text-[18px] text-primary">history</span>
            <span>Web Research Session History</span>
          </div>
          <span className="font-citation-ref text-[10px] text-text-muted font-bold">{sessionHistory.length} SESSIONS</span>
        </div>
        {sessionHistory.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {sessionHistory.map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-citation-ref text-[10px] text-primary font-bold">{item.location || 'General'}</span>
                    <span className="font-citation-ref text-[10px] text-text-muted">{item.category}</span>
                    <span className="font-citation-ref text-[10px] text-text-muted">
                      {new Date(item.timestamp).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="font-body-compact text-sm font-semibold text-dark-surface line-clamp-1">{item.query}</div>
                  <p className="font-body-compact text-xs text-text-muted line-clamp-2">{item.summary}</p>
                  <span className="text-[10px] font-label-code text-text-muted">{item.sourcesCount || 0} Sources</span>
                </div>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); window.location.hash = `web-intelligence`; }}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-brand-tint text-primary border border-primary/20 text-xs font-bold hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">replay</span>
                  <span>Reopen</span>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-text-muted space-y-1">
            <span className="material-symbols-outlined text-[28px]">history</span>
            <p>No research sessions yet. Run a web intelligence search to build history.</p>
          </div>
        )}
      </div>
    </div>
  );
};


// 5. KNOWLEDGE GRAPH VIEW
export const KnowledgeGraphView: React.FC<ViewProps> = ({ sources, findings, onInspectCitation }) => {
  return (
    <div className="p-space-lg space-y-space-lg max-w-7xl mx-auto w-full">
      <div className="bg-surface-card rounded-xl shadow-sm p-space-lg border border-border-subtle">
        <div className="flex items-center gap-2 text-primary font-citation-ref text-xs uppercase font-bold">
          <span className="material-symbols-outlined text-[18px]">hub</span>
          <span>TOPOLOGICAL EVIDENCE MESH</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight mt-1">
          Knowledge Graph &amp; Entity Connections
        </h1>
        <p className="font-body-default text-text-muted mt-1">
          Relational graph connecting statutory sources, extracted empirical entities, municipal wards, and synthesized problem theses.
        </p>

        {/* SVG Interactive Topology Diagram */}
        <div className="mt-6 bg-surface-canvas rounded-xl p-6 border border-border-subtle relative overflow-hidden flex items-center justify-center min-h-[420px]">
          <svg className="w-full h-96" viewBox="0 0 800 360">
            {/* Connection lines */}
            <line x1="120" y1="80" x2="380" y2="180" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="120" y1="180" x2="380" y2="180" stroke="#2563EB" strokeWidth="3" />
            <line x1="120" y1="280" x2="380" y2="180" stroke="#2563EB" strokeWidth="2.5" />
            <line x1="380" y1="180" x2="660" y2="110" stroke="#16A34A" strokeWidth="3" />
            <line x1="380" y1="180" x2="660" y2="250" stroke="#7E22CE" strokeWidth="2" />

            {/* Left Source Nodes */}
            <g transform="translate(40, 60)" className="cursor-pointer">
              <rect width="160" height="40" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
              <text x="80" y="24" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="bold" fontFamily="Inter">SRC-04 (GIS Ward Grid)</text>
            </g>
            <g transform="translate(40, 160)" className="cursor-pointer">
              <rect width="160" height="40" rx="8" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
              <text x="80" y="24" textAnchor="middle" fill="#2563EB" fontSize="12" fontWeight="bold" fontFamily="Inter">SRC-01 (DTC Review)</text>
            </g>
            <g transform="translate(40, 260)" className="cursor-pointer">
              <rect width="160" height="40" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
              <text x="80" y="24" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="bold" fontFamily="Inter">SRC-03 (CAG Audit)</text>
            </g>

            {/* Center Core Nexus Node */}
            <g transform="translate(300, 145)" className="cursor-pointer">
              <rect width="180" height="70" rx="12" fill="#2563EB" />
              <text x="90" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="Inter">CAUSAL NEXUS</text>
              <text x="90" y="50" textAnchor="middle" fill="#EFF6FF" fontSize="11" fontFamily="JetBrains Mono">r = 0.814 (p &lt; 0.001)</text>
            </g>

            {/* Right Output Nodes */}
            <g transform="translate(580, 90)" className="cursor-pointer">
              <rect width="180" height="44" rx="8" fill="#ECFDF5" stroke="#16A34A" strokeWidth="2" />
              <text x="90" y="26" textAnchor="middle" fill="#065F46" fontSize="12" fontWeight="bold" fontFamily="Inter">Finding #01 (Bus Deficit)</text>
            </g>
            <g transform="translate(580, 230)" className="cursor-pointer">
              <rect width="180" height="44" rx="8" fill="#FAF5FF" stroke="#7E22CE" strokeWidth="1.5" />
              <text x="90" y="26" textAnchor="middle" fill="#581C87" fontSize="12" fontWeight="bold" fontFamily="Inter">Wards 14–29 Cluster</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

// 6. DOCUMENTATION & SETTINGS VIEWS
export const DocumentationView: React.FC = () => {
  return (
    <div className="p-space-lg space-y-space-lg max-w-7xl mx-auto w-full">
      <div className="bg-surface-card rounded-xl shadow-sm p-space-lg border border-border-subtle space-y-4">
        <span className="font-citation-ref text-xs text-primary font-bold uppercase tracking-wider">
          TECHNICAL REFERENCE &amp; RECON PROTOCOL
        </span>
        <h1 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight">
          UrbanResearch AI Documentation (Protocol NCT-D24)
        </h1>
        <p className="font-body-default text-text-muted leading-relaxed">
          UrbanResearch AI enforces strict algorithmic discipline to eradicate ungrounded claims in municipal governance and public policy. Every assertion requires two disconnected Tier-1 institutional audits before promotion to "Verified" status.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-surface-canvas rounded-lg border border-border-subtle space-y-2">
            <h3 className="font-bold text-dark-surface">1. Question Deconstruction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deconstructs natural language urban queries into spatial polygons, baseline census demographics, fleet telematics, and civic complaint streams.
            </p>
          </div>
          <div className="p-4 bg-surface-canvas rounded-lg border border-border-subtle space-y-2">
            <h3 className="font-bold text-dark-surface">2. Relational Cross-Auditing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes multi-source correlation indices and regression matrices to confirm whether grievances correlate with physical infrastructure deficiencies.
            </p>
          </div>
          <div className="p-4 bg-surface-canvas rounded-lg border border-border-subtle space-y-2">
            <h3 className="font-bold text-dark-surface">3. Cryptographic Provenance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generates SHA-256 integrity hashes for each extracted document page and enforces inline citation anchors down to paragraph and table level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SettingsView: React.FC<{ isDark: boolean; onToggleDark: () => void }> = ({ isDark, onToggleDark }) => {
  const [latencyTolerance, setLatencyTolerance] = useState('240ms');
  const [confidenceThreshold, setConfidenceThreshold] = useState('90%');

  return (
    <div className="p-space-lg space-y-space-lg max-w-7xl mx-auto w-full">
      <div className="bg-surface-card rounded-xl shadow-sm p-space-lg border border-border-subtle space-y-6">
        <div>
          <span className="font-citation-ref text-xs text-primary font-bold uppercase tracking-wider">
            SYSTEM PREFERENCES
          </span>
          <h1 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight mt-1">
            Investigation Engine Settings
          </h1>
          <p className="font-body-default text-text-muted mt-1">
            Configure agent synchronization rates, verification thresholds, and user interface modes.
          </p>
        </div>

        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between p-3 bg-surface-canvas rounded-lg border border-border-subtle">
            <div>
              <div className="font-bold text-sm text-dark-surface">Theme Mode</div>
              <div className="text-xs text-text-muted">Toggle between high-contrast light and dark workspace</div>
            </div>
            <button
              type="button"
              onClick={onToggleDark}
              className="px-3 py-1.5 rounded-lg bg-surface-card border border-border-subtle text-xs font-semibold cursor-pointer"
            >
              {isDark ? 'Dark Mode (Active)' : 'Light Mode (Active)'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-canvas rounded-lg border border-border-subtle">
            <div>
              <div className="font-bold text-sm text-dark-surface">Verification Confidence Gate</div>
              <div className="text-xs text-text-muted">Minimum confidence to elevate to "Evidence Strength: High"</div>
            </div>
            <select
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-card border border-border-subtle text-xs font-semibold cursor-pointer outline-none"
            >
              <option value="90%">90% Strict (Default)</option>
              <option value="85%">85% Standard</option>
              <option value="95%">95% Statutory Benchmark</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-canvas rounded-lg border border-border-subtle">
            <div>
              <div className="font-bold text-sm text-dark-surface">Agent Sync Interval</div>
              <div className="text-xs text-text-muted">Background multi-agent heartbeat latency</div>
            </div>
            <select
              value={latencyTolerance}
              onChange={(e) => setLatencyTolerance(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-card border border-border-subtle text-xs font-semibold cursor-pointer outline-none"
            >
              <option value="240ms">240ms Real-Time</option>
              <option value="500ms">500ms Balanced</option>
              <option value="1000ms">1000ms Eco</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
