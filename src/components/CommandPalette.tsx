import React, { useState, useEffect } from 'react';
import { NavigationPath, Finding, Source, Investigation } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: NavigationPath) => void;
  onInspectCitation: (sourceId: string) => void;
  findings: Finding[];
  sources: Source[];
  investigations: Investigation[];
  onOpenNewResearch: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onInspectCitation,
  findings,
  sources,
  investigations,
  onOpenNewResearch
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredFindings = findings.filter(f => 
    f.title.toLowerCase().includes(query.toLowerCase()) ||
    f.findingNumber.toLowerCase().includes(query.toLowerCase()) ||
    f.narrative.toLowerCase().includes(query.toLowerCase())
  );

  const filteredSources = sources.filter(s => 
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.identifier.toLowerCase().includes(query.toLowerCase()) ||
    s.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredInvestigations = investigations.filter(i => 
    i.title.toLowerCase().includes(query.toLowerCase()) ||
    i.city.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-dark-surface/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-card rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden border border-border-subtle animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-border-subtle flex items-center gap-3 bg-surface-canvas">
          <span className="material-symbols-outlined text-[22px] text-primary">search</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search evidence, citations, datasets, or type a command..."
            className="w-full bg-transparent font-body-default text-body-default text-dark-surface placeholder:text-text-muted outline-none"
          />
          <kbd className="font-label-code text-label-code text-text-muted px-2 py-0.5 rounded bg-surface-card border border-border-subtle shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Search Results list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Navigation & Quick Actions */}
          {(() => {
            const navCommands = [
              { path: 'overview-dashboard' as NavigationPath, label: 'Overview Dashboard', icon: 'dashboard', section: 'OVERVIEW', keywords: 'home overview dashboard' },
              { path: 'research-workspace' as NavigationPath, label: 'Research Workspace (Live)', icon: 'science', section: 'RESEARCH', badge: 'STAGE 4/6', keywords: 'workspace research investigation live' },
              { path: 'discoveries-and-findings' as NavigationPath, label: 'Discovered Findings', icon: 'lightbulb', section: 'RESEARCH', badge: '8 VERIFIED', keywords: 'findings discoveries problems' },
              { path: 'cross-source-analysis' as NavigationPath, label: 'Cross-Source Analysis', icon: 'account_tree', section: 'RESEARCH', badge: 'r = +0.814', keywords: 'causal cross source correlation regression' },
              { path: 'web-intelligence' as NavigationPath, label: 'Web Intelligence (Google Search)', icon: 'travel_explore', section: 'RESEARCH', badge: 'LIVE WEB', keywords: 'web intelligence search assistant news google' },
              { path: 'alert-center' as NavigationPath, label: 'Civic Alert Center', icon: 'emergency', section: 'MONITOR', badge: 'LIVE 311', keywords: 'alert center 311 grievance emergency tickets' },
              { path: 'sources-and-datasets' as NavigationPath, label: 'Sources & Datasets', icon: 'database', section: 'LIBRARY', keywords: 'sources datasets ground truth archives' },
              { path: 'document-intelligence' as NavigationPath, label: 'Document Intelligence & OCR Evidence', icon: 'document_scanner', section: 'RESEARCH', badge: 'OCR & PDF', keywords: 'document intelligence ocr pdf verification cag audit' },
              { path: 'data-analysis' as NavigationPath, label: 'Data Analysis (Econometric & Spatial Regression)', icon: 'query_stats', section: 'RESEARCH', badge: 'REGRESSION', keywords: 'data analysis econometric spatial regression pearson ols' },
              { path: 'knowledge-graph' as NavigationPath, label: 'Knowledge Graph & Topological Mesh', icon: 'hub', section: 'RESEARCH', badge: 'TOPOLOGY', keywords: 'knowledge graph topological evidence mesh nodes edges' },
              { path: 'research-reports' as NavigationPath, label: 'Reports & Saved Briefs', icon: 'description', section: 'LIBRARY', keywords: 'reports briefs export download pdf' },
              { path: 'research-history' as NavigationPath, label: 'Research Session History', icon: 'history', section: 'LIBRARY', badge: 'HISTORY', keywords: 'history past sessions searches queries web intelligence' },
              { path: 'settings' as NavigationPath, label: 'Settings', icon: 'settings', section: 'SYSTEM', keywords: 'settings preferences theme dark light confidence' },
              { path: 'documentation' as NavigationPath, label: 'Help & Guided Tour', icon: 'menu_book', section: 'SYSTEM', keywords: 'help tour documentation guide recon protocol' },
            ];

            const filteredNav = navCommands.filter(c => 
              !query.trim() ||
              c.label.toLowerCase().includes(query.toLowerCase()) ||
              c.section.toLowerCase().includes(query.toLowerCase()) ||
              c.keywords.toLowerCase().includes(query.toLowerCase())
            );

            if (filteredNav.length === 0 && query.trim()) return null;

            return (
              <div className="space-y-1">
                <div className="text-micro-meta font-micro-meta text-text-muted uppercase px-2 py-1 font-bold flex items-center justify-between">
                  <span>Navigation &amp; Quick Actions</span>
                  <span className="text-[10px] font-mono">{filteredNav.length} DESTINATIONS</span>
                </div>
                
                {/* New Research Action */}
                {(!query.trim() || 'start new research create'.includes(query.toLowerCase())) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNewResearch();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-canvas text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">add_circle</span>
                      <span className="font-body-compact font-semibold text-dark-surface">Start New Urban Research</span>
                    </div>
                    <span className="font-citation-ref text-citation-ref text-text-muted">↵ Action</span>
                  </button>
                )}

                {filteredNav.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate(item.path);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-canvas text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-[18px] text-text-muted group-hover:text-primary transition-colors">
                        {item.icon}
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-body-compact font-semibold text-dark-surface truncate">
                          {item.label}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-text-muted bg-surface-canvas px-1.5 py-0.2 rounded border border-border-subtle shrink-0">
                          {item.section}
                        </span>
                      </div>
                    </div>
                    {item.badge && (
                      <span className="font-citation-ref text-[11px] px-1.5 py-0.5 rounded font-bold bg-brand-tint text-primary border border-primary/20 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Sources Section */}
          {filteredSources.length > 0 && (
            <div className="space-y-1">
              <div className="text-micro-meta font-micro-meta text-text-muted uppercase px-2 py-1 font-bold">
                Ground Truth Citations ({filteredSources.length})
              </div>
              {filteredSources.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onInspectCitation(s.identifier);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-canvas text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-citation-ref text-citation-ref px-1.5 py-0.5 rounded bg-brand-tint text-primary font-bold shrink-0">
                      {s.identifier}
                    </span>
                    <span className="font-body-compact text-body-compact text-dark-surface font-medium truncate">
                      {s.title}
                    </span>
                  </div>
                  <span className="font-citation-ref text-citation-ref text-secondary shrink-0 ml-2">
                    {s.reliabilityTier}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Findings Section */}
          {filteredFindings.length > 0 && (
            <div className="space-y-1">
              <div className="text-micro-meta font-micro-meta text-text-muted uppercase px-2 py-1 font-bold">
                Verified Findings ({filteredFindings.length})
              </div>
              {filteredFindings.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('discoveries-and-findings');
                  }}
                  className="w-full flex items-start justify-between p-2 rounded-lg hover:bg-surface-canvas text-left transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-citation-ref text-citation-ref text-primary font-bold">
                        {f.findingNumber}
                      </span>
                      <span className="font-citation-ref text-citation-ref bg-secondary-container text-on-secondary-container px-1 rounded font-bold">
                        {f.evidenceStrength}
                      </span>
                    </div>
                    <p className="font-body-compact text-xs text-dark-surface truncate">
                      {f.title}
                    </p>
                  </div>
                  <span className="font-citation-ref text-xs text-text-muted shrink-0">
                    {f.confidence}%
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Investigations Section */}
          {filteredInvestigations.length > 0 && (
            <div className="space-y-1">
              <div className="text-micro-meta font-micro-meta text-text-muted uppercase px-2 py-1 font-bold">
                Recent Investigations ({filteredInvestigations.length})
              </div>
              {filteredInvestigations.map((inv) => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('research-workspace');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-canvas text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-text-muted">token</span>
                    <span className="font-body-compact text-xs text-dark-surface font-semibold truncate">
                      {inv.title}
                    </span>
                  </div>
                  <span className="font-citation-ref text-xs text-text-muted shrink-0">
                    {inv.city}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-surface-canvas border-t border-border-subtle flex items-center justify-between text-micro-meta text-text-muted">
          <span>Navigation: ↑ ↓ to navigate</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
