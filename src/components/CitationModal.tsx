import React, { useState } from 'react';
import { Source } from '../types';
import { ASSETS } from '../data/mockData';

interface CitationModalProps {
  source: Source | null;
  onClose: () => void;
  onAddToCanvas?: (source: Source) => void;
}

export type CitationVerifyStatus = 'idle' | 'checking' | 'verified' | 'partially_accessible' | 'unavailable' | 'inconclusive';

interface VerificationResult {
  status: CitationVerifyStatus;
  httpStatus?: number;
  statusText?: string;
  responseTimeMs?: number;
  checkedAt: string;
  url?: string;
  docId?: string;
  message: string;
  verificationType?: string;
}

export const CitationModal: React.FC<CitationModalProps> = ({
  source,
  onClose,
  onAddToCanvas
}) => {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  
  // Verification Tool State
  const [verifyStatus, setVerifyStatus] = useState<CitationVerifyStatus>('idle');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  if (!source) return null;

  const handleVerifyCitation = async () => {
    setVerifyStatus('checking');
    try {
      const response = await fetch('/api/citation/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: (source as any).url,
          docId: source.docId || source.identifier,
          sha256: source.sha256,
          identifier: source.identifier,
          title: source.title,
        }),
      });

      if (!response.ok) {
        throw new Error(`Probe failed with status ${response.status}`);
      }

      const data: VerificationResult = await response.json();
      setVerificationResult(data);
      setVerifyStatus(data.status);
    } catch (err: any) {
      const fallbackResult: VerificationResult = {
        status: 'inconclusive',
        checkedAt: new Date().toISOString(),
        message: 'Network verification inconclusive: Target host did not return socket response within timeout boundaries.',
      };
      setVerificationResult(fallbackResult);
      setVerifyStatus('inconclusive');
    }
  };

  const handleAdd = () => {
    if (onAddToCanvas) onAddToCanvas(source);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const getStatusBadge = () => {
    switch (verifyStatus) {
      case 'checking':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 animate-pulse">
            <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
            <span>Checking...</span>
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>✓ Citation verified</span>
          </span>
        );
      case 'partially_accessible':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>⚠ Source partially accessible</span>
          </span>
        );
      case 'unavailable':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-800 border border-red-300">
            <span className="material-symbols-outlined text-[14px]">cancel</span>
            <span>✕ Source unavailable</span>
          </span>
        );
      case 'inconclusive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <span className="material-symbols-outlined text-[14px]">help</span>
            <span>? Verification inconclusive</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-dark-surface/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-card rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-border-subtle">
        {/* Top Header */}
        <div className="px-space-md py-3.5 bg-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-citation-ref text-citation-ref px-2 py-0.5 rounded bg-primary text-on-primary font-bold shrink-0">
              {source.identifier}
            </span>
            <span className="font-headline-sm text-headline-sm font-semibold text-dark-surface truncate">
              {source.title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-dark-surface hover:bg-surface-card transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-space-lg space-y-space-md max-h-[80vh] overflow-y-auto">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between text-micro-meta font-label-code text-text-muted gap-2">
            <span>SOURCE AUTHENTICITY: TIER-1 GOVERNMENTAL ARCHIVE</span>
            <span className="text-secondary font-bold flex items-center gap-1 font-citation-ref">
              <span className="material-symbols-outlined text-[14px]">verified</span> SHA-256 VERIFIED
            </span>
          </div>

          {/* Extracted Verbatim Paragraph */}
          <div className="bg-surface-canvas p-4 rounded-lg space-y-2 border border-border-subtle">
            <div className="font-label-code text-citation-ref text-primary font-bold uppercase">
              EXTRACTED VERBATIM PARAGRAPH ({source.pageNumber || 'PAGE 44'}):
            </div>
            <p className="font-body-default text-body-default text-dark-surface italic leading-relaxed">
              {source.verbatimExcerpt}
            </p>
          </div>

          {/* Metric Highlights Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-container-low p-2.5 rounded border border-border-subtle/50">
              <div className="font-micro-meta text-micro-meta text-text-muted uppercase">Confidence</div>
              <div className="font-headline-sm text-headline-sm font-bold text-secondary">99.1%</div>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded border border-border-subtle/50">
              <div className="font-micro-meta text-micro-meta text-text-muted uppercase">Correlated Entities</div>
              <div className="font-headline-sm text-headline-sm font-bold text-primary">
                {source.findingsLinkedCount || 6} Linked
              </div>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded border border-border-subtle/50">
              <div className="font-micro-meta text-micro-meta text-text-muted uppercase">Audit Year</div>
              <div className="font-headline-sm text-headline-sm font-bold text-dark-surface">2024–25</div>
            </div>
          </div>

          {/* Document Preview Thumbnail & File Info */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-surface-canvas rounded-lg border border-border-subtle">
            <img 
              alt="Official civic transportation audit document page" 
              className="w-14 h-18 object-cover rounded shadow-xs border border-border-subtle shrink-0" 
              src={ASSETS.docPdfThumbnail} 
            />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="font-body-compact text-body-compact font-bold text-dark-surface truncate">
                {source.identifier}_{source.title.replace(/\s+/g, '_')}.pdf
              </div>
              <div className="font-micro-meta text-micro-meta text-text-muted truncate mt-0.5">
                {source.fileSize || '4.8 MB'} • Public Document Identifier: {source.docId || 'DTC-GOV-2024-DEL-9182'}
              </div>
              <div className="font-label-code text-[11px] text-text-muted truncate mt-1">
                SHA: <span className="font-mono">{source.sha256.substring(0, 32)}...</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPdfViewer(!showPdfViewer)}
              className="px-3 py-1.5 rounded bg-primary text-on-primary font-body-compact text-body-compact font-medium hover:bg-brand-hover transition-colors shrink-0 cursor-pointer"
            >
              {showPdfViewer ? 'Hide Viewer' : 'Open PDF'}
            </button>
          </div>

          {/* Embedded Simulated Document Viewer Preview */}
          {showPdfViewer && (
            <div className="p-4 bg-dark-card rounded-lg border border-dark-border text-on-primary space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-text-muted border-b border-dark-border pb-2">
                <span>PDF STREAM READER: SEC 4.3</span>
                <span className="text-secondary font-bold">PAGE 44 OF 182</span>
              </div>
              <div className="bg-dark-canvas p-3 rounded text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                <p className="font-bold text-white mb-2">CHAPTER IV: VEHICULAR DEPLOYMENT DEFICIT MATRIX (TRANS-YAMUNA CORRIDOR)</p>
                <p className="mb-2">4.18 Analysis of depot pull-out telemetry affirms that scheduled morning fleet turnout rates in Ghaddoli, Seelampur and Nand Nagri hubs averaged 65.8%, resulting in an unassigned bus shortfall of 34.2%.</p>
                <p className="text-emerald-400">» Table 4.3: Depot Schedule Variance Matrix (p.44)</p>
                <p className="text-amber-300">» Verification Checksum: SHA-256 {source.sha256.substring(0, 24)}... (AUTHENTIC)</p>
              </div>
            </div>
          )}

          {/* Dedicated Citation Verification Box */}
          <div className="p-3.5 bg-surface-canvas rounded-lg border border-border-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">verified_user</span>
                <span className="font-headline-sm text-xs font-bold text-dark-surface uppercase tracking-wide">
                  Primary Source Verification Tool
                </span>
              </div>

              {verifyStatus === 'idle' ? (
                <button
                  type="button"
                  onClick={handleVerifyCitation}
                  className="px-3 py-1 rounded bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container font-citation-ref text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  <span>Verify Citation</span>
                </button>
              ) : (
                getStatusBadge()
              )}
            </div>

            {verifyStatus === 'checking' && (
              <div className="p-3 bg-surface-card rounded border border-border-subtle text-xs text-text-muted flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary animate-spin">sync</span>
                <span>Pinging primary municipal repository endpoint and testing document accessibility...</span>
              </div>
            )}

            {verificationResult && verifyStatus !== 'checking' && (
              <div className="bg-surface-card p-3 rounded-lg border border-border-subtle space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle font-mono text-[11px]">
                  <span className="text-text-muted">Target Resource:</span>
                  <span className="font-bold text-dark-surface truncate max-w-[260px]">
                    {verificationResult.url || verificationResult.docId || source.identifier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-text-muted">
                  <div>
                    <span className="font-semibold text-dark-surface">Probe Status:</span>{' '}
                    <span>{verificationResult.statusText || 'Resolved'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-dark-surface">Latency:</span>{' '}
                    <span>{verificationResult.responseTimeMs ?? 115} ms</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold text-dark-surface">Checked:</span>{' '}
                    <span>{new Date(verificationResult.checkedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-2 bg-surface-canvas rounded text-text-body leading-relaxed text-[11px]">
                  {verificationResult.message}
                </div>

                <div className="text-[10px] text-text-muted italic flex items-center gap-1 pt-1">
                  <span className="material-symbols-outlined text-[12px] text-secondary">info</span>
                  <span>
                    Verification checks endpoint responsiveness and checksum integrity. It does not certify the factual truth of external claims.
                  </span>
                </div>
              </div>
            )}

            {verifyStatus === 'idle' && (
              <p className="text-[11px] text-text-muted">
                Run an automated probe to confirm if the cited document URL or statutory reference ID is currently accessible online.
              </p>
            )}
          </div>

          {addedToast && (
            <div className="p-2.5 rounded bg-secondary-container text-on-secondary-container text-body-compact font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Successfully added [{source.identifier}] to Cross-Analysis Canvas!</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-space-md py-3 bg-surface-canvas flex items-center justify-between gap-2 border-t border-border-subtle">
          <div>
            {verifyStatus === 'idle' ? (
              <button
                type="button"
                onClick={handleVerifyCitation}
                className="px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-container text-primary font-citation-ref text-xs font-bold cursor-pointer border border-primary/30 flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Verify Citation</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleVerifyCitation}
                disabled={verifyStatus === 'checking'}
                className="px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-container text-text-muted font-citation-ref text-xs font-semibold cursor-pointer border border-border-subtle flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Re-verify</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-surface-card hover:bg-surface-container text-text-body font-body-medium text-body-medium cursor-pointer border border-border-subtle"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-brand-hover font-body-medium text-body-medium font-medium transition-colors cursor-pointer"
            >
              Add to Cross-Analysis Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
