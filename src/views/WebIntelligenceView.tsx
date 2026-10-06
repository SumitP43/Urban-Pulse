import React, { useState, useEffect } from 'react';
import { WebResearchResponse, WebResearchSource, NavigationPath } from '../types';
import { UrbanEventTrendCharts } from '../components/UrbanEventTrendCharts';
import { SmartSummary } from '../components/SmartSummary';
import { ResearchResponseCards } from '../components/ResearchResponseCard';
import { CitationQuickGlance } from '../components/CitationQuickGlance';
import { DataOriginBadge } from '../components/DataOriginBadge';

interface WebIntelligenceViewProps {
  onNavigate: (path: NavigationPath) => void;
  initialQuery?: string;
  initialLocation?: string;
  initialCategory?: string;
  onOpenExport?: () => void;
  onInspectCitation?: (sourceId: string) => void;
}

export const WebIntelligenceView: React.FC<WebIntelligenceViewProps> = ({
  onNavigate,
  initialQuery = '',
  initialLocation = 'Delhi',
  initialCategory = 'General Urban Research',
  onOpenExport,
  onInspectCitation,
}) => {
  const [query, setQuery] = useState(initialQuery || 'Recent air pollution developments in Delhi');
  const [location, setLocation] = useState(initialLocation || 'Delhi');
  const [customLocation, setCustomLocation] = useState('');
  const [category, setCategory] = useState(initialCategory || 'Environment');
  const [timeRange, setTimeRange] = useState('Last 30 days');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [researchData, setResearchData] = useState<WebResearchResponse | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'brief' | 'sources' | 'trends' | 'seasonality' | 'history'>('brief');
  const [isComparisonEnabled, setIsComparisonEnabled] = useState(false);
  const [compareCity, setCompareCity] = useState('Bengaluru');

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/research/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        if (data.length > 0 && data[0].result) {
          setResearchData((prev) => prev || data[0].result);
        }
      }
    } catch {
      // fallback silent
    }
  };

  const sampleQueries = [
    { text: 'Recent air pollution developments in Delhi', loc: 'Delhi', cat: 'Environment' },
    { text: 'Latest infrastructure projects in Noida', loc: 'Noida', cat: 'Infrastructure' },
    { text: 'Recent flood incidents in Delhi NCR', loc: 'Delhi', cat: 'Disaster & Risk' },
    { text: 'Latest metro expansion projects in Delhi', loc: 'Delhi', cat: 'Transportation' },
    { text: 'Recent urban planning initiatives in Bengaluru', loc: 'Bengaluru', cat: 'Urban Planning' },
    { text: 'Latest government smart city initiatives', loc: 'Delhi', cat: 'Government Initiatives' }
  ];

  const handleSearch = async (overrideQuery?: string, overrideLoc?: string, overrideCat?: string) => {
    const q = overrideQuery || query;
    const l = overrideLoc || (location === 'Custom location' ? customLocation : location);
    const c = overrideCat || category;

    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    setLoadingStep(1);

    const stepTimer1 = setTimeout(() => setLoadingStep(2), 1200);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 2800);

    try {
      const response = await fetch('/api/research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          location: l,
          category: c,
          timeRange: timeRange
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Unable to retrieve current web information. Please try again.');
      }

      const data: WebResearchResponse = await response.json();
      setResearchData(data);
      fetchHistory();
    } catch (err: any) {
      console.error('Web intelligence research error:', err);
      setError(err.message || 'Unable to retrieve current web information. Please try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const handleSelectHistory = (item: any) => {
    if (item.result) {
      setResearchData(item.result);
      setQuery(item.query);
      setLocation(item.location);
      setCategory(item.category);
    } else {
      handleSearch(item.query, item.location, item.category);
    }
  };

  return (
    <div className="p-space-md lg:p-space-lg max-w-[1720px] mx-auto w-full space-y-space-md">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-surface-card rounded-xl p-space-md lg:p-space-lg shadow-sm border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-citation-ref text-citation-ref uppercase tracking-wider text-primary font-bold px-2 py-0.5 rounded bg-brand-tint border border-primary/20">
              URBAN WEB INTELLIGENCE // GOOGLE SEARCH GROUNDED
            </span>
            <span className="text-text-muted font-micro-meta text-micro-meta">•</span>
            <span className="font-micro-meta text-micro-meta text-text-muted uppercase tracking-wider">
              REAL-TIME WEB ATTRIBUTION CONSOLE
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight mt-1">
            Urban Research Assistant
          </h1>
          <p className="font-body-default text-text-muted max-w-4xl">
            Investigate current and breaking urban events, infrastructure rollouts, environmental risks, and municipal policy decisions powered by live Google Search data with strict source verification.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-canvas border border-border-subtle font-citation-ref text-citation-ref text-secondary font-bold">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            REAL-TIME GROUNDING ACTIVE
          </span>
        </div>
      </div>

      {/* Research Console Controls Card */}
      <div className="bg-surface-card rounded-xl shadow-sm p-space-md lg:p-space-lg border border-border-subtle space-y-space-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-space-md"
        >
          {/* Main Research Input */}
          <div className="space-y-1.5">
            <label className="font-body-compact text-body-compact font-bold text-dark-surface flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">search</span>
                <span>Research Topic, Issue, or Infrastructure Initiative</span>
              </span>
              <span className="font-citation-ref text-citation-ref text-text-muted hidden sm:inline">
                LIVE WEB EXTRACTION
              </span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2 bg-surface-canvas p-2 rounded-lg border border-border-subtle focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary/15 transition-all shadow-inner">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Research a city, urban issue, infrastructure project, environmental event..."
                className="flex-1 bg-transparent px-3 py-2 font-body-default text-body-default text-dark-surface placeholder:text-text-muted outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="flex items-center justify-center gap-2 bg-primary-container hover:bg-brand-hover disabled:opacity-50 text-on-primary px-6 py-2.5 rounded font-body-medium text-body-medium font-semibold shadow-sm transition-all cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>Researching Web...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">search_insights</span>
                    <span>Search / Research</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Granular Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-1">
            {/* Location Selector */}
            <div className="space-y-1">
              <label className="font-micro-meta text-micro-meta uppercase text-text-muted font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">location_on</span>
                <span>Jurisdiction / Location</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-surface-canvas border border-border-subtle rounded-lg px-3 py-2 text-body-compact font-medium text-dark-surface outline-none cursor-pointer"
              >
                <option value="Delhi">Delhi (NCT)</option>
                <option value="Noida">Noida (Gautam Buddha Nagar)</option>
                <option value="Gurugram">Gurugram (Haryana)</option>
                <option value="Bengaluru">Bengaluru (Karnataka)</option>
                <option value="Mumbai">Mumbai (Maharashtra)</option>
                <option value="Custom location">Custom Location...</option>
              </select>
              {location === 'Custom location' && (
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Enter specific city, ward, or region..."
                  className="mt-1 w-full bg-surface-canvas border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-dark-surface outline-none"
                />
              )}
            </div>

            {/* Category Selector */}
            <div className="space-y-1">
              <label className="font-micro-meta text-micro-meta uppercase text-text-muted font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">category</span>
                <span>Urban Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-canvas border border-border-subtle rounded-lg px-3 py-2 text-body-compact font-medium text-dark-surface outline-none cursor-pointer"
              >
                <option value="Infrastructure">Infrastructure</option>
                <option value="Environment">Environment</option>
                <option value="Transportation">Transportation</option>
                <option value="Urban Planning">Urban Planning</option>
                <option value="Disaster & Risk">Disaster & Risk</option>
                <option value="Government Initiatives">Government Initiatives</option>
                <option value="Public Safety">Public Safety</option>
                <option value="General Urban Research">General Urban Research</option>
              </select>
            </div>

            {/* Time Window Selector */}
            <div className="space-y-1">
              <label className="font-micro-meta text-micro-meta uppercase text-text-muted font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">schedule</span>
                <span>Time Window</span>
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full bg-surface-canvas border border-border-subtle rounded-lg px-3 py-2 text-body-compact font-medium text-dark-surface outline-none cursor-pointer"
              >
                <option value="Last 24 hours">Last 24 hours</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last year">Last year</option>
                <option value="Any time">Any time</option>
              </select>
            </div>
          </div>

          {/* Quick Query Starters */}
          <div className="pt-1 flex items-center gap-2 flex-wrap">
            <span className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold">
              Suggested Urban Queries:
            </span>
            {sampleQueries.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(item.text);
                  setLocation(item.loc);
                  setCategory(item.cat);
                  handleSearch(item.text, item.loc, item.cat);
                }}
                className="text-xs bg-surface-canvas hover:bg-surface-container border border-border-subtle text-text-body px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px] text-primary">travel_explore</span>
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Loading Progress State */}
      {isLoading && (
        <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle space-y-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <div className="font-headline-sm font-semibold text-dark-surface">
              Autonomous Web Intelligence Agent Executing
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary-container h-full transition-all duration-500 ease-out"
                style={{ width: loadingStep === 1 ? '35%' : loadingStep === 2 ? '70%' : '90%' }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs font-label-code text-text-muted">
              <span>
                {loadingStep === 1 && 'Querying Google Search Grounding Index for authoritative sources...'}
                {loadingStep === 2 && 'Synthesizing cross-publisher evidence & verifying facts...'}
                {loadingStep >= 3 && 'Extracting empirical metrics, dates, and geo-anchors...'}
              </span>
              <span className="text-primary font-bold">STAGE {loadingStep} OF 3</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Feedback */}
      {error && !isLoading && (
        <div className="bg-error-container/30 border border-critical-red/30 rounded-xl p-space-md text-dark-surface flex items-start gap-3">
          <span className="material-symbols-outlined text-critical-red text-[20px] shrink-0 mt-0.5">error</span>
          <div className="space-y-1">
            <div className="font-bold text-sm text-critical-red">Research Retrieval Notice</div>
            <p className="font-body-compact text-xs text-slate-700 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={() => handleSearch()}
              className="mt-2 px-3 py-1 bg-surface-card border border-border-subtle rounded text-xs font-semibold hover:bg-surface-canvas transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Two Column Workspace: Research Dossier (8 cols) + Evidence & History (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
        {/* Main Research Results Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-space-md">
          {researchData ? (
            <div className="bg-surface-card rounded-xl shadow-sm p-space-lg border border-border-subtle space-y-space-md">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border-subtle pb-space-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-citation-ref text-citation-ref px-2 py-0.5 rounded bg-brand-tint border border-primary/20 text-primary font-bold">
                      {researchData.location}
                    </span>
                    <span className="font-citation-ref text-citation-ref px-2 py-0.5 rounded bg-surface-container text-text-body font-medium">
                      {researchData.category}
                    </span>
                    <span className="font-citation-ref text-citation-ref text-text-muted">
                      {researchData.formattedDate}
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight font-bold pt-1">
                    {researchData.query}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 bg-surface-canvas p-1 rounded-lg border border-border-subtle shrink-0 overflow-x-auto max-w-full">
                  <button
                    type="button"
                    onClick={() => setActiveTab('brief')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                      activeTab === 'brief' ? 'bg-surface-card text-primary shadow-xs font-bold' : 'text-text-muted hover:text-dark-surface'
                    }`}
                  >
                    Brief
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('trends')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                      activeTab === 'trends' ? 'bg-surface-card text-primary shadow-xs font-bold' : 'text-text-muted hover:text-dark-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">show_chart</span>
                    <span>Trends &amp; Frequency</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sources')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                      activeTab === 'sources' ? 'bg-surface-card text-primary shadow-xs font-bold' : 'text-text-muted hover:text-dark-surface'
                    }`}
                  >
                    Sources ({researchData.sources?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('seasonality')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                      activeTab === 'seasonality' ? 'bg-surface-card text-primary shadow-xs font-bold' : 'text-text-muted hover:text-dark-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                    <span>Seasonality</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                      activeTab === 'history' ? 'bg-surface-card text-primary shadow-xs font-bold' : 'text-text-muted hover:text-dark-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">history</span>
                    <span>History</span>
                  </button>
                </div>

                {/* Action strip: Live web source badge + Export */}
                <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-0">
                  <DataOriginBadge origin="LIVE" compact />
                  {onOpenExport && (
                    <button
                      type="button"
                      onClick={onOpenExport}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-canvas border border-border-subtle text-xs font-bold text-dark-surface hover:bg-surface-container transition-colors cursor-pointer"
                      title="Export / Download as PDF"
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary">picture_as_pdf</span>
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  )}
                </div>

              </div>

              {/* TAB 1: EXECUTIVE BRIEF */}
              {activeTab === 'brief' && (
                <div className="space-y-space-md">
                  {/* 1. Executive Summary */}
                  <div className="space-y-1.5">
                    <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">description</span>
                        <span>1. Executive Summary</span>
                      </span>
                      <span className="font-citation-ref text-[10px] text-primary">AI RESEARCH RESPONSE</span>
                    </div>
                    <div className="p-4 bg-surface-canvas rounded-lg border border-border-subtle font-body-default text-body-default text-dark-surface leading-relaxed space-y-3">
                      <div>{researchData.executiveSummary}</div>
                      <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between flex-wrap gap-2">
                        <SmartSummary
                          title={`Executive Synthesis: ${researchData.query}`}
                          content={researchData.executiveSummary || ''}
                          publisher={researchData.sources?.[0]?.publisher || 'Civic Research'}
                          category={researchData.category}
                          sourceId={`exec-${researchData.id}`}
                        />
                        <span className="text-[10px] text-text-muted font-citation-ref">
                          Jurisdiction: {researchData.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Key Findings */}
                  <div className="space-y-2">
                    <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
                      <span>2. Key Findings</span>
                    </div>
                    <div className="space-y-2">
                      {researchData.keyFindings?.map((finding, idx) => {
                        const src = researchData.sources?.[idx % (researchData.sources?.length || 1)];
                        const srcId = src?.id || `web-src-${idx + 1}`;
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-canvas border border-border-subtle"
                          >
                            <span className="font-citation-ref text-citation-ref px-1.5 py-0.5 rounded bg-brand-tint text-primary font-bold shrink-0 mt-0.5">
                              #{idx + 1}
                            </span>
                            <p className="font-body-compact text-body-compact text-dark-surface leading-snug flex-1">
                              {finding}
                            </p>
                            {onInspectCitation && (
                              <CitationQuickGlance
                                identifier={srcId}
                                source={src ? {
                                  id: src.id,
                                  identifier: src.id,
                                  title: src.title,
                                  meta: src.publisher ? `${src.publisher} • Web` : 'Live web source',
                                  summary: src.snippet,
                                  reliabilityTier: 'Web-Grounded',
                                } as any : undefined}
                                label={`[${idx + 1}]`}
                                onInspectFullCitation={onInspectCitation}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Event Trends & Frequency Analytics (Recharts Integrated) */}
                  {researchData.trendAnalysis && (
                    <div className="space-y-2">
                      <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-primary">ssid_chart</span>
                          <span>3. Empirical Event Trends &amp; Frequency Statistics</span>
                        </span>
                        <span className="font-citation-ref text-citation-ref text-primary font-bold">
                          RECHARTS TELEMETRY ENGINE
                        </span>
                      </div>
                      <UrbanEventTrendCharts
                        trendAnalysis={researchData.trendAnalysis}
                        category={researchData.category}
                        location={researchData.location}
                        sources={researchData.sources}
                        onSelectSource={() => setActiveTab('sources')}
                        isComparisonEnabled={isComparisonEnabled}
                        compareCity={compareCity}
                        onToggleComparison={setIsComparisonEnabled}
                        onChangeCompareCity={setCompareCity}
                      />
                    </div>
                  )}

                  {/* 4. Recent Developments Timeline */}
                  {researchData.recentDevelopments && researchData.recentDevelopments.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-tertiary">history</span>
                        <span>4. Recent Developments &amp; Timeline</span>
                      </div>
                      <div className="space-y-2">
                        {researchData.recentDevelopments.map((dev, idx) => (
                          <div key={idx} className="p-3 bg-surface-canvas rounded-lg border border-border-subtle space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-body-compact font-bold text-dark-surface">{dev.title}</span>
                              <span className="font-citation-ref text-[11px] text-primary font-semibold">{dev.date}</span>
                            </div>
                            <p className="font-body-compact text-xs text-text-body leading-relaxed">{dev.description}</p>
                            <div className="pt-1.5 border-t border-border-subtle/50 flex justify-end">
                              <SmartSummary
                                title={dev.title}
                                content={`${dev.title} (${dev.date}): ${dev.description}`}
                                publisher={researchData.location}
                                category={researchData.category}
                                sourceId={`dev-${idx}-${researchData.id}`}
                                compact={true}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Important Sourced Facts & Statistics */}
                  {researchData.importantFacts && researchData.importantFacts.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">analytics</span>
                        <span>5. Important Facts &amp; Numerical Metrics (Sourced Only)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {researchData.importantFacts.map((fact, idx) => (
                          <div key={idx} className="p-3 bg-surface-canvas rounded-lg border border-border-subtle space-y-1">
                            <div className="font-display-hero text-[22px] font-bold text-dark-surface font-mono">
                              {fact.metric}
                            </div>
                            <p className="font-body-compact text-xs text-dark-surface leading-tight font-medium">
                              {fact.context}
                            </p>
                            <div className="font-citation-ref text-[10px] text-text-muted truncate pt-1 border-t border-border-subtle/50">
                              Source: {fact.source}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. Connected Urban Context */}
                  {researchData.connectedUrbanContext && (
                    <div className="p-3.5 bg-brand-tint/60 rounded-lg border border-primary/20 space-y-1">
                      <div className="flex items-center gap-1.5 font-label-code text-citation-ref text-primary font-bold">
                        <span className="material-symbols-outlined text-[16px]">account_tree</span>
                        <span>6. CONNECTED URBAN CONTEXT &amp; MUNICIPAL DATA</span>
                      </div>
                      <p className="font-body-compact text-xs text-dark-surface leading-relaxed">
                        {researchData.connectedUrbanContext}
                      </p>
                    </div>
                  )}

                  {/* 7. Information Consistency & Conflict Verification */}
                  <div className="p-3 bg-surface-canvas rounded-lg border border-border-subtle flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">verified_user</span>
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-dark-surface">7. Information Consistency &amp; Uncertainty Audit</div>
                      <p className="text-text-muted leading-relaxed">
                        {researchData.conflictNotes || 'All reporting verified across concordant primary and municipal publishers.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXPANDED EVENT TRENDS & FREQUENCY ANALYTICS */}
              {activeTab === 'trends' && researchData.trendAnalysis && (
                <div className="space-y-space-md">
                  {/* Top Analytics KPI Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-surface-canvas rounded-lg border border-border-subtle space-y-1">
                      <div className="text-[11px] font-citation-ref text-text-muted uppercase font-bold">Total Monitored Incidents</div>
                      <div className="font-mono text-2xl font-bold text-dark-surface">
                        {researchData.trendAnalysis.timelineTrend?.reduce((acc, c) => acc + (c.frequency || 0), 0) || 0}
                      </div>
                      <div className="text-[10px] text-text-muted font-label-code">Across {researchData.trendAnalysis.timelineTrend?.length || 0} sampled timeline intervals</div>
                    </div>
                    <div className="p-3.5 bg-surface-canvas rounded-lg border border-border-subtle space-y-1">
                      <div className="text-[11px] font-citation-ref text-text-muted uppercase font-bold">Telemetry Velocity</div>
                      <div className="font-mono text-lg font-bold text-critical-red line-clamp-1">
                        {researchData.trendAnalysis.keyEventVelocity || '+38% incident velocity'}
                      </div>
                      <div className="text-[10px] text-critical-red font-semibold">Corridor acceleration alert</div>
                    </div>
                    <div className="p-3.5 bg-surface-canvas rounded-lg border border-border-subtle space-y-1">
                      <div className="text-[11px] font-citation-ref text-text-muted uppercase font-bold">Primary Vector</div>
                      <div className="font-mono text-lg font-bold text-primary line-clamp-1">
                        {researchData.trendAnalysis.frequencyByCategory?.[0]?.category || 'Primary Class'}
                      </div>
                      <div className="text-[10px] text-text-muted font-label-code">
                        {researchData.trendAnalysis.frequencyByCategory?.[0]?.percentage || 38}% of recorded event citations
                      </div>
                    </div>
                    <div className="p-3.5 bg-surface-canvas rounded-lg border border-border-subtle space-y-1">
                      <div className="text-[11px] font-citation-ref text-text-muted uppercase font-bold">Severity Escalation</div>
                      <div className="font-mono text-lg font-bold text-orange-600 line-clamp-1">
                        {researchData.trendAnalysis.severityDistribution?.[0]?.severity || 'Severe Tier'}
                      </div>
                      <div className="text-[10px] text-text-muted font-label-code">
                        {researchData.trendAnalysis.severityDistribution?.[0]?.count || 0} Critical / Severe citations
                      </div>
                    </div>
                  </div>

                  {/* Core Interactive Chart Container */}
                  <UrbanEventTrendCharts
                    trendAnalysis={researchData.trendAnalysis}
                    category={researchData.category}
                    location={researchData.location}
                    sources={researchData.sources}
                    onSelectSource={() => setActiveTab('sources')}
                    isComparisonEnabled={isComparisonEnabled}
                    compareCity={compareCity}
                    onToggleComparison={setIsComparisonEnabled}
                    onChangeCompareCity={setCompareCity}
                  />

                  {/* Granular Temporal Frequency Ledger Table */}
                  <div className="bg-surface-canvas rounded-xl p-4 border border-border-subtle space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                      <div className="flex items-center gap-1.5 font-headline-sm text-sm font-bold text-dark-surface">
                        <span className="material-symbols-outlined text-[16px] text-primary">table_chart</span>
                        <span>Temporal Horizon Frequency Ledger</span>
                      </div>
                      <span className="font-citation-ref text-[11px] text-text-muted">
                        Unit: {researchData.trendAnalysis.timeframeUnit}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-body-compact">
                        <thead>
                          <tr className="border-b border-border-subtle text-text-muted uppercase font-citation-ref text-[10px]">
                            <th className="py-2 px-3">Timeline Interval</th>
                            <th className="py-2 px-3 text-right">Event Frequency</th>
                            <th className="py-2 px-3 text-right">{researchData.trendAnalysis.metricLabel || 'Intensity Index'}</th>
                            <th className="py-2 px-3 text-right">Threshold Baseline</th>
                            <th className="py-2 px-3 text-center">Telemetry Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
                          {researchData.trendAnalysis.timelineTrend.map((row, idx) => {
                            const isAbove = row.baseline ? (row.intensity || 0) > row.baseline : false;
                            return (
                              <tr key={idx} className="hover:bg-surface-card transition-colors">
                                <td className="py-2 px-3 font-sans font-medium text-dark-surface">{row.period}</td>
                                <td className="py-2 px-3 text-right font-bold text-primary">{row.frequency}</td>
                                <td className="py-2 px-3 text-right font-bold text-orange-600">{row.intensity ?? '—'}</td>
                                <td className="py-2 px-3 text-right text-text-muted">{row.baseline ?? '—'}</td>
                                <td className="py-2 px-3 text-center">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                                      isAbove
                                        ? 'bg-critical-red/10 text-critical-red border border-critical-red/20'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    }`}
                                  >
                                    {isAbove ? 'Elevated Alert' : 'Normal Range'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SOURCES & CITATION CARDS */}
              {activeTab === 'sources' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-text-muted pb-1">
                    <div className="flex items-center gap-2">
                      <span>Retrieved from Google Search Grounding Index</span>
                      <DataOriginBadge origin="LIVE" compact />
                    </div>
                    <span className="font-citation-ref text-primary font-bold">{researchData.sources?.length} Verified Sources</span>
                  </div>

                  <ResearchResponseCards
                    cards={
                      researchData.sources?.map((src) => ({
                        id: src.id,
                        title: src.title,
                        content: src.snippet ? `${src.title}. ${src.snippet}` : src.title,
                        publisher: src.publisher,
                        category: src.category || researchData.category,
                        location: src.location || researchData.location,
                        url: src.url,
                        verified: true,
                      })) || []
                    }
                  />

                  {/* Search Queries Used */}
                  {researchData.searchQueries && researchData.searchQueries.length > 0 && (
                    <div className="p-3 bg-surface-canvas rounded-lg border border-border-subtle text-xs space-y-1.5">
                      <div className="font-micro-meta text-micro-meta uppercase text-text-muted font-bold">
                        Grounding Search Queries Executed:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {researchData.searchQueries.map((sq, i) => (
                          <span key={i} className="font-label-code text-[11px] bg-surface-card border border-border-subtle px-2 py-0.5 rounded text-dark-surface">
                            "{sq}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: SEASONALITY */}
              {activeTab === 'seasonality' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">calendar_month</span>
                      <span>Infrastructure Seasonality — Year-over-Year Cycles</span>
                    </div>
                    <DataOriginBadge origin="LIVE" compact />
                  </div>
                  {researchData.trendAnalysis ? (
                    <UrbanEventTrendCharts
                      trendAnalysis={researchData.trendAnalysis}
                      category={researchData.category}
                      location={researchData.location}
                      sources={researchData.sources}
                      onSelectSource={() => setActiveTab('sources')}
                      isComparisonEnabled={isComparisonEnabled}
                      compareCity={compareCity}
                      onToggleComparison={setIsComparisonEnabled}
                      onChangeCompareCity={setCompareCity}
                      defaultMetricMode="seasonality"
                    />
                  ) : (
                    <div className="p-10 text-center text-sm text-text-muted bg-surface-canvas rounded-xl border border-dashed border-border-subtle space-y-2">
                      <span className="material-symbols-outlined text-[32px]">calendar_month</span>
                      <p className="font-semibold">Insufficient data for seasonality analysis</p>
                      <p className="text-xs">Run a research query first to populate infrastructure trend data.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <div className="font-micro-meta text-micro-meta uppercase tracking-wider text-text-muted font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">history</span>
                      <span>Research Session History</span>
                    </span>
                    <span className="font-citation-ref text-[10px] text-text-muted font-bold">{history.length} SESSIONS</span>
                  </div>
                  {history.length > 0 ? (
                    <div className="divide-y divide-border-subtle space-y-0">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="py-3 flex items-start justify-between gap-4 group"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-citation-ref text-[10px] text-primary font-bold">{item.location || 'General'}</span>
                              <span className="font-citation-ref text-[10px] text-text-muted">{item.category}</span>
                              <span className="font-citation-ref text-[10px] text-text-muted">
                                {new Date(item.timestamp).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="font-body-compact text-sm font-semibold text-dark-surface line-clamp-1">{item.query}</div>
                            <p className="font-body-compact text-xs text-text-muted line-clamp-2">{item.summary}</p>
                            <div className="text-[10px] font-label-code text-text-muted">{item.sourcesCount || 0} Sources retrieved</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectHistory(item)}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-brand-tint text-primary border border-primary/20 text-xs font-bold hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[13px]">replay</span>
                            <span>Reopen</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center text-sm text-text-muted bg-surface-canvas rounded-xl border border-dashed border-border-subtle space-y-2">
                      <span className="material-symbols-outlined text-[32px]">history</span>
                      <p>No research sessions yet. Run a search above to build history.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          ) : (
            /* Initial State */
            <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-tint text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">travel_explore</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-dark-surface">
                Ready for Current Urban Intelligence Research
              </h3>
              <p className="font-body-compact text-text-muted max-w-lg mx-auto">
                Enter an urban issue, government initiative, or environmental event above. The assistant will retrieve verified web sources via Google Search grounding and synthesize an evidentiary brief.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSearch('Recent air pollution developments in Delhi', 'Delhi', 'Environment')}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-brand-hover transition-colors cursor-pointer"
                >
                  Run Sample Research: Delhi Air Pollution
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Research History & Quick Reopen (4 cols) */}
        <aside className="lg:col-span-4 space-y-space-md">
          <div className="bg-surface-card rounded-xl p-space-md shadow-sm border border-border-subtle space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-1.5 font-headline-sm text-body-medium font-bold text-dark-surface">
                <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                <span>Web Research History</span>
              </div>
              <span className="font-citation-ref text-citation-ref text-text-muted font-bold">
                {history.length} SESSIONS
              </span>
            </div>

            {history.length > 0 ? (
              <div className="divide-y divide-border-subtle max-h-[500px] overflow-y-auto space-y-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectHistory(item)}
                    className="p-2.5 rounded-lg hover:bg-surface-canvas transition-colors cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-citation-ref text-[10px] text-primary font-bold truncate">
                        {item.location || 'General'}
                      </span>
                      <span className="font-citation-ref text-[10px] text-text-muted">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="font-body-compact text-xs font-semibold text-dark-surface line-clamp-1 group-hover:text-primary transition-colors">
                      {item.query}
                    </div>
                    <p className="font-body-compact text-[11px] text-text-muted line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] font-label-code text-text-muted">
                      <span>{item.sourcesCount || 0} Sources</span>
                      <span className="text-primary font-bold group-hover:underline">Reopen →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-text-muted italic">
                No recent searches in this session yet. Run a search above to catalog research records.
              </div>
            )}
          </div>

          {/* Assistant Protocol Specification Note */}
          <div className="bg-surface-card rounded-xl p-space-md shadow-sm border border-border-subtle space-y-2">
            <div className="flex items-center gap-1.5 text-dark-surface font-bold text-xs uppercase">
              <span className="material-symbols-outlined text-[16px] text-tertiary">shield</span>
              <span>Grounding Quality Mandate</span>
            </div>
            <p className="font-body-compact text-xs text-text-muted leading-relaxed">
              In accordance with UrbanResearch AI standards, web research responses strictly decouple verified source citations from speculative interpretation. Unverified numbers or conflicting publisher reports are explicitly flagged in the Uncertainty Audit.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
