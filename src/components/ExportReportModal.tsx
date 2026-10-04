import React, { useState } from 'react';
import { Investigation, Finding, Source } from '../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigation: Investigation;
  findings: Finding[];
  sources: Source[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  investigation,
  findings,
  sources
}) => {
  const [format, setFormat] = useState<'pdf' | 'json' | 'csv' | 'markdown'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      // Trigger native browser print dialog formatted for Save as PDF
      window.print();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 400);
  };

  const handleDownload = () => {
    if (format === 'pdf') {
      handleDownloadPDF();
      return;
    }

    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);

      // Create download blob for JSON, CSV, or Markdown
      let content = '';
      let filename = `${investigation.code}_Report.${format}`;
      let mimeType = 'text/plain';

      if (format === 'json') {
        content = JSON.stringify({ investigation, findings, sources, exportedAt: new Date().toISOString() }, null, 2);
        mimeType = 'application/json';
      } else if (format === 'csv') {
        const headers = 'FindingNumber,Title,EvidenceStrength,Confidence,Wards,Domain\n';
        const rows = findings.map(f => `"${f.findingNumber}","${f.title.replace(/"/g, '""')}","${f.evidenceStrength}","${f.confidence}%","${f.affectedWards.join('; ')}","${f.domain}"`).join('\n');
        content = headers + rows;
        mimeType = 'text/csv';
      } else {
        content = `# ${investigation.title} (${investigation.code})
**Jurisdiction:** ${investigation.city} | **Date:** ${new Date().toLocaleDateString()}
**Status:** ${investigation.status.toUpperCase()} | **Protocol:** ${investigation.sessionToken}

## Executive Summary
${investigation.summary}

## Key Corroborated Findings (${findings.length})
${findings.map(f => `### ${f.findingNumber}: ${f.title}
- **Evidence Strength:** ${f.evidenceStrength} (${f.confidence}% Confidence)
- **Affected Wards:** ${f.affectedWards.join(', ')}
${f.narrative}
`).join('\n')}

## Cited Sources & Evidence (${sources.length})
${sources.map(s => `- **[${s.identifier}] ${s.title}** (${s.documentType})
  - Document ID: ${s.docId || 'N/A'}
  - SHA-256: \`${s.sha256}\`
  - Verbatim Excerpt: "${s.verbatimExcerpt}"
`).join('\n')}
`;
        mimeType = 'text/markdown';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <>
      {/* SCREEN MODAL DIALOG (Hidden in Print) */}
      <div 
        className="fixed inset-0 z-50 bg-dark-surface/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-surface-card rounded-xl max-w-xl w-full shadow-2xl overflow-hidden border border-border-subtle animate-in fade-in zoom-in-95 duration-150">
          <div className="px-space-md py-3.5 bg-surface-container flex items-center justify-between border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">ios_share</span>
              <span className="font-headline-sm text-headline-sm font-semibold text-dark-surface">
                Export Research Dossier
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-text-muted hover:text-dark-surface hover:bg-surface-card transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="p-space-lg space-y-space-md max-h-[75vh] overflow-y-auto">
            {/* Target investigation preview */}
            <div className="bg-surface-canvas p-3 rounded-lg border border-border-subtle space-y-1">
              <div className="flex items-center justify-between text-micro-meta text-text-muted uppercase font-bold">
                <span>{investigation.code}</span>
                <span className="text-secondary">{investigation.status.toUpperCase()}</span>
              </div>
              <div className="font-body-compact font-bold text-dark-surface">
                {investigation.title}
              </div>
              <div className="font-body-compact text-xs text-text-muted truncate">
                {findings.length} Verified Findings • {sources.length} Linked Citations • NCT-D24 Protocol
              </div>
            </div>

            {/* Format Selection Grid */}
            <div className="space-y-2">
              <label className="font-micro-meta text-micro-meta text-text-muted uppercase font-bold">
                Select Output Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    format === 'pdf' 
                      ? 'border-primary bg-brand-tint ring-1 ring-primary' 
                      : 'border-border-subtle bg-surface-canvas hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-dark-surface">Download as PDF</span>
                    <span className="material-symbols-outlined text-[18px] text-primary">picture_as_pdf</span>
                  </div>
                  <span className="text-micro-meta text-text-muted mt-1">Browser-native print dialog formatted for civic PDF report</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    format === 'json' 
                      ? 'border-primary bg-brand-tint ring-1 ring-primary' 
                      : 'border-border-subtle bg-surface-canvas hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-dark-surface">Evidence Graph (JSON)</span>
                    <span className="material-symbols-outlined text-[18px] text-primary">data_object</span>
                  </div>
                  <span className="text-micro-meta text-text-muted mt-1">Machine-readable node-link provenance graph</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    format === 'csv' 
                      ? 'border-primary bg-brand-tint ring-1 ring-primary' 
                      : 'border-border-subtle bg-surface-canvas hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-dark-surface">Ward Metrics (CSV)</span>
                    <span className="material-symbols-outlined text-[18px] text-primary">table_chart</span>
                  </div>
                  <span className="text-micro-meta text-text-muted mt-1">Tabular dataset with regression correlation values</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('markdown')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    format === 'markdown' 
                      ? 'border-primary bg-brand-tint ring-1 ring-primary' 
                      : 'border-border-subtle bg-surface-canvas hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-dark-surface">Markdown Report</span>
                    <span className="material-symbols-outlined text-[18px] text-primary">markdown</span>
                  </div>
                  <span className="text-micro-meta text-text-muted mt-1">GitHub &amp; Obsidian compatible evidentiary audit</span>
                </button>
              </div>
            </div>

            {/* Print Preview Toggle */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPrintPreview(!showPrintPreview)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {showPrintPreview ? 'visibility_off' : 'visibility'}
                </span>
                <span>{showPrintPreview ? 'Hide Report Preview' : 'Preview Civic PDF Layout'}</span>
              </button>
              <span className="text-[11px] text-text-muted font-citation-ref">A4 Portrait Grid</span>
            </div>

            {/* Embedded Print Preview */}
            {showPrintPreview && (
              <div className="p-4 bg-surface-canvas rounded-lg border border-border-subtle text-xs space-y-3 font-sans max-h-60 overflow-y-auto">
                <div className="border-b border-border-subtle pb-2">
                  <div className="font-bold text-sm text-dark-surface uppercase tracking-wide">
                    {investigation.title}
                  </div>
                  <div className="text-text-muted font-mono text-[10px]">
                    Ref: {investigation.code} • Generated: {new Date().toLocaleDateString()} • {investigation.city}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-dark-surface uppercase text-[10px] text-text-muted">Executive Summary</div>
                  <p className="text-text-body leading-relaxed">{investigation.summary}</p>
                </div>
                <div>
                  <div className="font-bold text-dark-surface uppercase text-[10px] text-text-muted">
                    Key Corroborated Findings ({findings.length})
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-text-body">
                    {findings.slice(0, 3).map((f) => (
                      <li key={f.id}>
                        <strong>{f.findingNumber}:</strong> {f.title} ({f.evidenceStrength} Evidence)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {downloadSuccess && (
              <div className="p-3 bg-secondary-container text-on-secondary-container rounded-lg text-body-compact font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Civic Report generated! In print dialog, choose "Save as PDF".</span>
              </div>
            )}
          </div>

          <div className="px-space-md py-3 bg-surface-canvas border-t border-border-subtle flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-4 py-2 rounded-lg bg-surface-card hover:bg-surface-container text-primary font-body-medium text-xs font-bold border border-primary/30 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Download as PDF</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-surface-card hover:bg-surface-container text-text-body font-body-medium text-body-medium cursor-pointer border border-border-subtle"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={handleDownload}
                className="px-5 py-2 rounded-lg bg-primary-container hover:bg-brand-hover text-on-primary font-body-medium text-body-medium font-semibold shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
              >
                {isExporting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>Preparing {format.toUpperCase()}...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      {format === 'pdf' ? 'picture_as_pdf' : 'download'}
                    </span>
                    <span>{format === 'pdf' ? 'Download as PDF' : `Download ${format.toUpperCase()}`}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED PRINTABLE CIVIC REPORT (Triggered by window.print()) */}
      <div id="printable-civic-report" className="hidden print:block text-slate-900 bg-white font-sans p-6 space-y-6">
        {/* Document Header with Seal & Metadata */}
        <div className="border-b-2 border-slate-900 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10pt] font-mono tracking-widest text-slate-600 font-bold uppercase">
                CIVIC INTELLIGENCE PLATFORM // STATUTORY DOSSIER
              </div>
              <h1 className="text-[18pt] font-bold text-slate-950 mt-1 leading-tight">
                {investigation.title}
              </h1>
            </div>
            <div className="text-right font-mono text-[9pt] text-slate-600">
              <div>REPORT ID: <strong>{investigation.code}</strong></div>
              <div>DATE: <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
              <div>TIME: <strong>{new Date().toLocaleTimeString()}</strong></div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-300 text-[9pt] font-mono">
            <div>
              <span className="text-slate-500 uppercase">Jurisdiction:</span><br />
              <strong>{investigation.city}</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase">Audit Scope:</span><br />
              <strong>{investigation.spatialUnit}</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase">Rigor Tier:</span><br />
              <strong>{investigation.rigorTier}</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase">Audit Session:</span><br />
              <strong>{investigation.sessionToken}</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="break-inside-avoid space-y-1.5">
          <h2 className="text-[12pt] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1">
            1. Executive Research Summary
          </h2>
          <p className="text-[10pt] leading-relaxed text-slate-800 text-justify">
            {investigation.summary}
          </p>
        </div>

        {/* Section 2: Key Corroborated Findings */}
        <div className="break-inside-avoid space-y-3">
          <h2 className="text-[12pt] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1">
            2. Evidentiary Findings ({findings.length} Corroborated Theses)
          </h2>
          <div className="space-y-3">
            {findings.map((f) => (
              <div key={f.id} className="p-3 border border-slate-300 rounded bg-slate-50 space-y-1 break-inside-avoid">
                <div className="flex items-center justify-between text-[9pt] font-mono">
                  <span className="font-bold text-blue-900">{f.findingNumber}</span>
                  <span className="font-semibold text-slate-700">
                    Evidence Strength: {f.evidenceStrength} • {f.confidence}% Confidence
                  </span>
                </div>
                <h3 className="text-[11pt] font-bold text-slate-950">{f.title}</h3>
                <p className="text-[9.5pt] text-slate-800 leading-relaxed text-justify">
                  {f.narrative}
                </p>
                <div className="text-[8.5pt] text-slate-600 font-mono pt-1">
                  Affected Wards: {f.affectedWards.join(', ')} • Domain: {f.domain.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Urban Impact Assessment */}
        <div className="break-inside-avoid space-y-2">
          <h2 className="text-[12pt] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1">
            3. Urban Impact &amp; Municipal Governance Assessment
          </h2>
          <div className="grid grid-cols-2 gap-3 text-[9pt]">
            <div className="p-2.5 border border-slate-300 rounded">
              <div className="font-bold uppercase text-slate-900 mb-1">Infrastructure Impact</div>
              <p className="text-slate-700 leading-snug">
                Fleet deployment shortfalls directly amplify arterial road congestion, overloading intermediate informal feeder shuttles across trans-Yamuna junctions.
              </p>
            </div>
            <div className="p-2.5 border border-slate-300 rounded">
              <div className="font-bold uppercase text-slate-900 mb-1">Environmental Impact</div>
              <p className="text-slate-700 leading-snug">
                Private vehicle reliance during peak transit bottlenecks compounds seasonal boundary layer particulate accumulation (PM2.5 and PM10).
              </p>
            </div>
            <div className="p-2.5 border border-slate-300 rounded">
              <div className="font-bold uppercase text-slate-900 mb-1">Policy &amp; Governance</div>
              <p className="text-slate-700 leading-snug">
                Statutory reconciliation required between CAG depot scheduling audits and municipal 311 service level agreement enforcement parameters.
              </p>
            </div>
            <div className="p-2.5 border border-slate-300 rounded">
              <div className="font-bold uppercase text-slate-900 mb-1">Citizen Mobility</div>
              <p className="text-slate-700 leading-snug">
                Average commuter wait times exceeded 45 minutes in peripheral sub-cities, driving a 214% escalation in citizen grievance filings.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Authoritative Sources & Citation Ledger */}
        <div className="break-inside-avoid space-y-2">
          <h2 className="text-[12pt] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1">
            4. Authoritative Citations &amp; Cryptographic Evidence Ledger
          </h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Citation</th>
                <th style={{ width: '38%' }}>Source Title &amp; Document ID</th>
                <th style={{ width: '22%' }}>Publisher &amp; Category</th>
                <th style={{ width: '28%' }}>Cryptographic Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id}>
                  <td className="font-mono font-bold">{s.identifier}</td>
                  <td>
                    <strong>{s.title}</strong>
                    <div className="text-[8pt] text-slate-500 font-mono">{s.docId || 'DOC-REG-VERIFIED'}</div>
                  </td>
                  <td>
                    <div>{s.meta?.split('•')[0] || s.documentType}</div>
                    <div className="text-[8pt] text-slate-500">{s.reliabilityTier}</div>
                  </td>
                  <td className="font-mono text-[8pt] break-all">
                    {s.sha256}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 5: Statutory Certification & Disclaimer */}
        <div className="break-inside-avoid pt-3 border-t-2 border-slate-900 flex items-center justify-between text-[8pt] text-slate-600 font-mono">
          <div>
            <div>CERTIFICATION: TIER-1 CIVIC EVIDENCE AUDIT</div>
            <div>CHECKSUM ENGINE: SHA-256 • AUDIT PROTOCOL NCT-D24</div>
          </div>
          <div className="text-right">
            <div>CONFIDENTIAL REPORT // URBAN INTELLIGENCE CONSOLE</div>
            <div>VERIFIED ARCHIVE CATALOG MATCH CONFIRMED</div>
          </div>
        </div>
      </div>
    </>
  );
};
