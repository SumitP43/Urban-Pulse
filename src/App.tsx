import React, { useState, useEffect } from 'react';
import { NavigationPath, Investigation, Source } from './types';
import {
  INITIAL_INVESTIGATIONS,
  SOURCES,
  FINDINGS,
  AGENT_LOGS,
  WORKFLOW_STEPS
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CitationModal } from './components/CitationModal';
import { CommandPalette } from './components/CommandPalette';
import { NewResearchModal } from './components/NewResearchModal';
import { ExportReportModal } from './components/ExportReportModal';
import { OverviewDashboardView } from './views/OverviewDashboardView';
import { ResearchWorkspaceView } from './views/ResearchWorkspaceView';
import { WebIntelligenceView } from './views/WebIntelligenceView';
import { DiscoveriesFindingsView } from './views/DiscoveriesFindingsView';
import { CrossSourceAnalysisView } from './views/CrossSourceAnalysisView';
import { AlertCenterView } from './views/AlertCenterView';
import {
  DataAnalysisView,
  DocumentIntelligenceView,
  SourcesDatasetsView,
  ResearchReportsView,
  KnowledgeGraphView,
  DocumentationView,
  SettingsView
} from './views/SecondaryViews';

export default function App() {
  const [currentPath, setCurrentPath] = useState<NavigationPath>('research-workspace');
  const [investigations, setInvestigations] = useState<Investigation[]>(INITIAL_INVESTIGATIONS);
  const [activeInvestigation, setActiveInvestigation] = useState<Investigation>(INITIAL_INVESTIGATIONS[0]);
  const [sources, setSources] = useState<Source[]>(SOURCES);
  const [findings, setFindings] = useState(FINDINGS);
  const [agentLogs, setAgentLogs] = useState(AGENT_LOGS);
  const [workflowSteps, setWorkflowSteps] = useState(WORKFLOW_STEPS);

  // Modals & Overlays state
  const [inspectingSource, setInspectingSource] = useState<Source | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewResearchOpen, setIsNewResearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('Delhi Urban Lab Workspace');
  const [isDark, setIsDark] = useState(false);
  const [webSearchQuery, setWebSearchQuery] = useState('');

  // Sync dark class on document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle citation inspection from anywhere (including web-src-* live sources)
  const handleInspectCitation = (identifierOrId: string) => {
    const cleanId = identifierOrId.replace('[', '').replace(']', '').trim();
    const found = sources.find(
      s => s.identifier === cleanId || s.id === cleanId ||
           s.identifier.toLowerCase() === cleanId.toLowerCase()
    );
    if (found) {
      setInspectingSource(found);
    } else if (cleanId.startsWith('web-src-') || cleanId.startsWith('web-')) {
      // Synthesise a lightweight source record for live web citations
      setInspectingSource({
        id: cleanId,
        identifier: cleanId,
        title: `Web Source: ${cleanId}`,
        meta: 'Live web source • Google Search Grounding',
        documentType: 'Web Article',
        reliabilityTier: 'Web-Grounded',
        summary: 'This citation was retrieved via real-time Google Search grounding. Open the primary source URL to review full content.',
      } as any);
    } else {
      // Generic fallback for unknown identifiers
      setInspectingSource(sources[0] ?? null);
    }
  };

  // Launch new research from modal
  const handleLaunchNewResearch = (params: {
    question: string;
    city: string;
    method: string;
    rigorTier: string;
    spatialUnit: string;
  }) => {
    const newInv: Investigation = {
      id: `inv-${Date.now()}`,
      code: `INV-2025-${Math.floor(100 + Math.random() * 900)}`,
      title: params.question,
      targetScope: `Autonomous spatial correlation across ${params.spatialUnit} under ${params.method}`,
      sessionToken: `UR-${params.city.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      progress: 35,
      status: 'running',
      domain: 'transportation',
      domainLabel: 'Transportation & Mobility',
      city: params.city,
      rigorTier: params.rigorTier,
      spatialUnit: params.spatialUnit,
      summary: `Initiated autonomous investigation on ${params.question}. Agents deployed for question deconstruction, source discovery, and spatial GIS vector cross-referencing.`,
      citations: ['DTC-DATA-Q3', 'MCD-311-LOGS', 'CAG-DEL-2024'],
      sourceDepth: 26,
      sourceList: 'DTC, CAG, 311 API',
      keyFindingsCount: 3,
      highStrengthCount: 2,
      auditChronology: 'Live Session',
      auditDate: 'Oct 24, 2026',
      updatedAgo: 'Just now',
      affectedWards: ['Ward 14–29 Cluster', 'Corridor Central']
    };

    setInvestigations([newInv, ...investigations]);
    setActiveInvestigation(newInv);
    setCurrentPath('research-workspace');
    setIsPaused(false);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-dark-canvas text-slate-100' : 'bg-surface-canvas text-text-body'}`}>
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        onOpenNewResearch={() => setIsNewResearchOpen(true)}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={(ws) => setCurrentWorkspace(ws)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
      />

      {/* Main App Container */}
      <div className="pl-72 flex flex-col min-h-screen">
        {/* Fixed Top Header */}
        <TopHeader
          activeInvestigation={activeInvestigation}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onJumpToWorkspace={() => setCurrentPath('research-workspace')}
          onNavigate={(p) => setCurrentPath(p)}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
        />

        {/* Main Content Area */}
        <main className="w-full pt-16 bg-surface-canvas flex-1">
          {currentPath === 'overview-dashboard' && (
            <OverviewDashboardView
              investigations={investigations}
              onNavigate={(path) => setCurrentPath(path)}
              onOpenNewResearch={() => setIsNewResearchOpen(true)}
              onSelectInvestigation={(inv) => {
                setActiveInvestigation(inv);
              }}
              onInspectCitation={handleInspectCitation}
              onLaunchWebSearch={(q) => {
                setWebSearchQuery(q);
                setCurrentPath('web-intelligence');
              }}
            />
          )}

          {currentPath === 'web-intelligence' && (
            <WebIntelligenceView
              onNavigate={(path) => setCurrentPath(path)}
              initialQuery={webSearchQuery}
              onOpenExport={() => setIsExportOpen(true)}
              onInspectCitation={handleInspectCitation}
            />
          )}

          {currentPath === 'alert-center' && (
            <AlertCenterView
              onNavigate={(path) => setCurrentPath(path)}
              onInspectCitation={handleInspectCitation}
              onLaunchInvestigation={(title, city) => {
                handleLaunchNewResearch({
                  question: title,
                  city: city,
                  method: 'Civic Grievance & SLA Cross-Audit',
                  rigorTier: 'Tier-1 Audits',
                  spatialUnit: `${city} Municipal Wards`
                });
              }}
              onLaunchWebSearch={(q, loc) => {
                setWebSearchQuery(q);
                setCurrentPath('web-intelligence');
              }}
              sources={sources}
            />
          )}

          {currentPath === 'research-workspace' && (
            <ResearchWorkspaceView
              investigation={activeInvestigation}
              sources={sources}
              agentLogs={agentLogs}
              steps={workflowSteps}
              onNavigate={(path) => setCurrentPath(path)}
              onInspectCitation={handleInspectCitation}
              onOpenExport={() => setIsExportOpen(true)}
              isPaused={isPaused}
              onTogglePause={() => setIsPaused(!isPaused)}
            />
          )}

          {currentPath === 'discoveries-and-findings' && (
            <DiscoveriesFindingsView
              findings={findings}
              sources={sources}
              onNavigate={(path) => setCurrentPath(path)}
              onInspectCitation={handleInspectCitation}
              onOpenExport={() => setIsExportOpen(true)}
            />
          )}

          {currentPath === 'cross-source-analysis' && (
            <CrossSourceAnalysisView
              sources={sources}
              findings={findings}
              onInspectCitation={handleInspectCitation}
              onOpenExport={() => setIsExportOpen(true)}
              onNavigate={(path) => setCurrentPath(path)}
            />
          )}

          {currentPath === 'data-analysis' && (
            <DataAnalysisView
              sources={sources}
              findings={findings}
              investigation={activeInvestigation}
              onInspectCitation={handleInspectCitation}
              onOpenExport={() => setIsExportOpen(true)}
              onNavigate={(path) => setCurrentPath(path)}
            />
          )}

          {currentPath === 'document-intelligence' && (
            <DocumentIntelligenceView
              sources={sources}
              findings={findings}
              investigation={activeInvestigation}
              onInspectCitation={handleInspectCitation}
              onOpenExport={() => setIsExportOpen(true)}
              onNavigate={(path) => setCurrentPath(path)}
            />
          )}

          {currentPath === 'sources-and-datasets' && (
            <SourcesDatasetsView
              sources={sources}
              findings={findings}
              investigation={activeInvestigation}
              onInspectCitation={handleInspectCitation}
              onOpenExport={() => setIsExportOpen(true)}
              onNavigate={(path) => setCurrentPath(path)}
            />
          )}

          {currentPath === 'research-reports' && (
            <ResearchReportsView
              sources={sources}
              findings={findings}
              investigation={activeInvestigation}
              onInspectCitation={handleInspectCitation}
              onOpenExport={() => setIsExportOpen(true)}
              onNavigate={(path) => setCurrentPath(path)}
              onReopenResearch={(q) => {
                setWebSearchQuery(q);
                setCurrentPath('web-intelligence');
              }}
            />
          )}

          {currentPath === 'knowledge-graph' && (
            <KnowledgeGraphView
              sources={sources}
              findings={findings}
              investigation={activeInvestigation}
              onInspectCitation={handleInspectCitation}
              onOpenExport={() => setIsExportOpen(true)}
              onNavigate={(path) => setCurrentPath(path)}
            />
          )}

          {currentPath === 'research-history' && (
            <WebIntelligenceView
              onNavigate={(path) => setCurrentPath(path)}
              initialQuery={webSearchQuery}
              initialTab="history"
              onOpenExport={() => setIsExportOpen(true)}
              onInspectCitation={handleInspectCitation}
            />
          )}

          {currentPath === 'saved-research' && (
            <ResearchReportsView
              sources={sources}
              findings={findings}
              investigation={activeInvestigation}
              onInspectCitation={handleInspectCitation}
              onOpenExport={() => setIsExportOpen(true)}
              onNavigate={(path) => setCurrentPath(path)}
              onReopenResearch={(q) => {
                setWebSearchQuery(q);
                setCurrentPath('web-intelligence');
              }}
            />
          )}

          {currentPath === 'documentation' && <DocumentationView />}

          {currentPath === 'settings' && (
            <SettingsView isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
          )}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <CitationModal
        source={inspectingSource}
        onClose={() => setInspectingSource(null)}
        onAddToCanvas={(src) => {
          setCurrentPath('cross-source-analysis');
        }}
      />

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(path) => setCurrentPath(path)}
        onInspectCitation={handleInspectCitation}
        findings={findings}
        sources={sources}
        investigations={investigations}
        onOpenNewResearch={() => setIsNewResearchOpen(true)}
      />

      <NewResearchModal
        isOpen={isNewResearchOpen}
        onClose={() => setIsNewResearchOpen(false)}
        onLaunch={handleLaunchNewResearch}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        investigation={activeInvestigation}
        findings={findings}
        sources={sources}
      />
    </div>
  );
}
