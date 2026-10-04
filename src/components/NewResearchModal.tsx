import React, { useState } from 'react';

interface NewResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (params: {
    question: string;
    city: string;
    method: string;
    rigorTier: string;
    spatialUnit: string;
  }) => void;
}

export const NewResearchModal: React.FC<NewResearchModalProps> = ({
  isOpen,
  onClose,
  onLaunch
}) => {
  const [question, setQuestion] = useState('Spatial distribution of DTC bus fleets vs 311 commuter grievances across East Delhi peripheral wards');
  const [city, setCity] = useState('NCT Delhi, IN');
  const [method, setMethod] = useState('Mixed Multi-Source Correlation');
  const [rigorTier, setRigorTier] = useState('Tier-1 Audits (Statutory)');
  const [spatialUnit, setSpatialUnit] = useState('272 Wards GIS');

  if (!isOpen) return null;

  const starters = [
    'Bus Fleet Distribution vs DTC Peak Overcrowding in East Delhi',
    'Solid Waste Collection Gaps & Overflow Hotspots in MCD 311 Logs',
    'DJB Water Pipeline Distribution Inequity vs Tanker Dispatch Volume',
    'Najafgarh Drain Siltation Compliance vs Chronic Arterial Waterlogging'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    onLaunch({
      question,
      city,
      method,
      rigorTier,
      spatialUnit
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-dark-surface/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-card rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden border border-border-subtle animate-in fade-in zoom-in-95 duration-150">
        <div className="px-space-lg py-space-md bg-surface-container flex items-center justify-between border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-dark-surface font-bold">
                Initialize Autonomous Urban Investigation
              </h2>
              <div className="font-micro-meta text-micro-meta text-text-muted uppercase tracking-wider">
                Multi-Agent Reconnaissance Pipeline Protocol NCT-D24
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-dark-surface hover:bg-surface-card transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-space-lg space-y-space-md max-h-[80vh] overflow-y-auto">
          {/* Research Prompt Field */}
          <div className="space-y-1.5">
            <label className="font-body-compact text-body-compact font-bold text-dark-surface flex items-center justify-between">
              <span>Primary Investigation Question / Thesis</span>
              <span className="font-citation-ref text-citation-ref text-primary">NLP ENTITY PARSER</span>
            </label>
            <div className="bg-surface-canvas rounded-lg p-2.5 border border-border-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <textarea
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask an urban research question, specify geographic wards, or paste a public dataset URL..."
                className="w-full bg-transparent font-body-default text-body-default text-dark-surface placeholder:text-text-muted outline-none resize-none"
              />
              <div className="flex items-center justify-between pt-1 border-t border-border-subtle/60 text-micro-meta text-text-muted">
                <span>Supports CSV, PDF, GeoJSON, Municipal 311 API endpoints</span>
                <span className="font-label-code text-citation-ref">{question.length} chars</span>
              </div>
            </div>

            {/* Quick Starters */}
            <div className="pt-1 space-y-1">
              <div className="font-micro-meta text-micro-meta text-text-muted uppercase tracking-wider font-bold">
                Investigation Starters:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {starters.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuestion(s)}
                    className="text-xs bg-surface-canvas hover:bg-surface-container text-text-body px-2.5 py-1 rounded transition-colors text-left flex items-center gap-1 border border-border-subtle cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px] text-primary">psychology</span>
                    <span className="truncate max-w-xs">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-2">
            <div className="space-y-1">
              <label className="font-micro-meta text-micro-meta text-text-muted uppercase font-bold">
                Target Territory / City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-surface-canvas border border-border-subtle rounded-lg px-3 py-2 text-body-compact font-medium text-dark-surface outline-none cursor-pointer"
              >
                <option value="NCT Delhi, IN">NCT Delhi, IN (272 Wards)</option>
                <option value="Mumbai MMR, IN">Mumbai MMR (227 Wards)</option>
                <option value="Bengaluru BBMP, IN">Bengaluru BBMP (198 Wards)</option>
                <option value="Chennai GCC, IN">Chennai GCC (200 Wards)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-micro-meta text-micro-meta text-text-muted uppercase font-bold">
                Analytical Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-surface-canvas border border-border-subtle rounded-lg px-3 py-2 text-body-compact font-medium text-dark-surface outline-none cursor-pointer"
              >
                <option value="Mixed Multi-Source Correlation">Mixed Multi-Source Correlation</option>
                <option value="Spatial Geostatistical Analysis">Spatial Geostatistical Analysis</option>
                <option value="Causal Econometric Tracing">Causal Econometric Tracing</option>
                <option value="Statutory Audit Discrepancy Reconciliation">Audit Discrepancy Reconciliation</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-micro-meta text-micro-meta text-text-muted uppercase font-bold">
                Evidence Rigor Tier
              </label>
              <select
                value={rigorTier}
                onChange={(e) => setRigorTier(e.target.value)}
                className="w-full bg-surface-canvas border border-border-subtle rounded-lg px-3 py-2 text-body-compact font-medium text-dark-surface outline-none cursor-pointer"
              >
                <option value="Tier-1 Audits (Statutory)">Tier-1 Audits (CAG & Govt Gazettes)</option>
                <option value="Tier-2 Open Municipal Data">Tier-2 Open Municipal Data (311 APIs)</option>
                <option value="Combined Multi-Tier Ground Truth">Combined Multi-Tier Ground Truth</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-micro-meta text-micro-meta text-text-muted uppercase font-bold">
                Spatial Aggregation Unit
              </label>
              <select
                value={spatialUnit}
                onChange={(e) => setSpatialUnit(e.target.value)}
                className="w-full bg-surface-canvas border border-border-subtle rounded-lg px-3 py-2 text-body-compact font-medium text-dark-surface outline-none cursor-pointer"
              >
                <option value="272 Wards GIS">272 Wards GIS Boundaries</option>
                <option value="Ward 14–29 Trans-Yamuna Cluster">Ward 14–29 Trans-Yamuna Cluster</option>
                <option value="Arterial Ring Road Corridors">Arterial Ring Road Corridors</option>
                <option value="Informal Settlement Polygons">Informal Settlement Polygons</option>
              </select>
            </div>
          </div>

          {/* Autonomous Agents Pipeline Guarantee */}
          <div className="p-3 rounded-lg bg-surface-canvas border border-border-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
              <span className="font-medium text-dark-surface">
                Strict 100% Cryptographic Citation Traceability Enforced
              </span>
            </div>
            <span className="font-citation-ref text-citation-ref text-primary font-bold">
              5 AGENTS ASSIGNED
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-canvas hover:bg-surface-container text-text-body font-body-medium text-body-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary-container hover:bg-brand-hover text-on-primary font-body-medium text-body-medium font-semibold shadow-sm flex items-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">auto_mode</span>
              <span>Launch Autonomous Investigation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
