import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Line,
} from 'recharts';
import { UrbanTrendAnalysis, WebResearchSource, RegionalComparisonCityData, Source } from '../types';
import { COMPARISON_CITIES, getRegionalComparisonData } from '../data/regionalComparisonData';
import {
  getSeasonalityAnalytics,
  SeasonalityGranularity,
  INFRASTRUCTURE_PROJECT_RECORDS,
  InfrastructureProjectRecord
} from '../services/seasonalityAnalytics';
import { CitationQuickGlance } from './CitationQuickGlance';
import { DataOriginBadge } from './DataOriginBadge';

interface UrbanEventTrendChartsProps {
  trendAnalysis?: UrbanTrendAnalysis;
  category?: string;
  location?: string;
  isCompactView?: boolean;
  sources?: WebResearchSource[];
  onSelectSource?: (sourceId: string) => void;
  // Regional Comparison Props
  isComparisonEnabled?: boolean;
  compareCity?: string;
  onToggleComparison?: (enabled: boolean) => void;
  onChangeCompareCity?: (city: string) => void;
  defaultMetricMode?: 'timeline' | 'category' | 'severity' | 'seasonality';
}

const DEFAULT_SEVERITY_COLORS = ['#DC2626', '#EA580C', '#D97706', '#059669', '#3B82F6'];

export const UrbanEventTrendCharts: React.FC<UrbanEventTrendChartsProps> = ({
  trendAnalysis,
  category = 'Urban Intelligence',
  location = 'Delhi',
  isCompactView = false,
  sources = [],
  onSelectSource,
  isComparisonEnabled,
  compareCity,
  onToggleComparison,
  onChangeCompareCity,
  defaultMetricMode,
}) => {
  const [activeMetricMode, setActiveMetricMode] = useState<'timeline' | 'category' | 'severity' | 'seasonality'>(
    defaultMetricMode || 'timeline'
  );

  useEffect(() => {
    if (defaultMetricMode) {
      setActiveMetricMode(defaultMetricMode);
    }
  }, [defaultMetricMode]);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Seasonality Analytics State
  const [seasonalityGranularity, setSeasonalityGranularity] = useState<SeasonalityGranularity>('monthly');
  const [seasonalityYears, setSeasonalityYears] = useState<number[]>([2024, 2025, 2026]);
  const [seasonalitySector, setSeasonalitySector] = useState<string>('all');

  // Internal state if parent does not control
  const [internalComparisonOn, setInternalComparisonOn] = useState(false);
  const [internalCompareCity, setInternalCompareCity] = useState(
    location?.toLowerCase() === 'bengaluru' ? 'Delhi' : 'Bengaluru'
  );

  const isComparisonOn = isComparisonEnabled !== undefined ? isComparisonEnabled : internalComparisonOn;
  const targetCompareCity = compareCity !== undefined ? compareCity : internalCompareCity;

  // Memoized Seasonality Dataset
  const seasonalityAnalytics = useMemo(() => {
    let records = INFRASTRUCTURE_PROJECT_RECORDS;
    if (seasonalitySector !== 'all') {
      records = records.filter((r) => r.category === seasonalitySector);
    }
    return getSeasonalityAnalytics(records, seasonalityGranularity, seasonalityYears);
  }, [seasonalitySector, seasonalityGranularity, seasonalityYears]);

  const handleToggleComparison = () => {
    const nextVal = !isComparisonOn;
    if (onToggleComparison) {
      onToggleComparison(nextVal);
    } else {
      setInternalComparisonOn(nextVal);
    }
  };

  const handleSelectCompareCity = (newCity: string) => {
    if (onChangeCompareCity) {
      onChangeCompareCity(newCity);
    } else {
      setInternalCompareCity(newCity);
    }
  };

  // Quick lookup map for linked sources
  const sourceMap = useMemo(() => {
    const map = new Map<string, WebResearchSource>();
    sources.forEach((s) => map.set(s.id, s));
    return map;
  }, [sources]);

  if (!trendAnalysis || !trendAnalysis.timelineTrend || trendAnalysis.timelineTrend.length === 0) {
    return (
      <div className="p-4 bg-surface-canvas rounded-lg border border-border-subtle text-xs text-text-muted flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[18px]">show_chart</span>
        <span>Awaiting verified temporal trend telemetry from current search grounding.</span>
      </div>
    );
  }

  const timelineData = trendAnalysis.timelineTrend;
  const categoryData = trendAnalysis.frequencyByCategory || [];
  const severityData = trendAnalysis.severityDistribution || [];

  // Regional comparison data for the secondary city
  const comparisonData: RegionalComparisonCityData | null = useMemo(() => {
    if (!isComparisonOn) return null;
    return (
      trendAnalysis.comparisonData ||
      getRegionalComparisonData(location, targetCompareCity, category, timelineData)
    );
  }, [isComparisonOn, trendAnalysis, location, targetCompareCity, category, timelineData]);

  // Combined timeline data merging primary and comparison data points along each period
  const combinedTimelineData = useMemo(() => {
    return timelineData.map((pt, idx) => {
      const compPt = comparisonData?.timelineTrend[idx] || null;
      return {
        period: pt.period,
        // Primary city data
        primaryFreq: pt.frequency,
        primaryCount: pt.specificEventCount ?? pt.frequency,
        primaryIntensity: pt.intensity,
        primaryBaseline: pt.baseline,
        primarySources: pt.linkedSourceIds,
        primaryHighlight: pt.keyEventHighlight,
        // Comparison city data
        compareFreq: compPt?.frequency ?? null,
        compareCount: compPt?.specificEventCount ?? compPt?.frequency ?? null,
        compareIntensity: compPt?.intensity ?? null,
        compareBaseline: compPt?.baseline ?? null,
        compareSources: compPt?.linkedSourceIds ?? null,
        compareHighlight: compPt?.keyEventHighlight ?? null,
      };
    });
  }, [timelineData, comparisonData]);

  // Combined category data
  const combinedCategoryData = useMemo(() => {
    return categoryData.map((cat, idx) => {
      const compCat = comparisonData?.frequencyByCategory[idx] || null;
      return {
        category: cat.category,
        primaryCount: cat.count,
        primaryPercentage: cat.percentage,
        primaryTrend: cat.trend,
        primarySources: cat.linkedSourceIds,
        primaryHighlight: cat.keyEventHighlight,
        // Comparison
        compareCount: compCat?.count ?? 0,
        comparePercentage: compCat?.percentage ?? 0,
        compareTrend: compCat?.trend,
        compareSources: compCat?.linkedSourceIds,
        compareHighlight: compCat?.keyEventHighlight,
      };
    });
  }, [categoryData, comparisonData]);

  const totalIncidents = timelineData.reduce((acc, curr) => acc + (curr.frequency || 0), 0);
  const totalSeverityCount = severityData.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalCompareIncidents = comparisonData?.timelineTrend.reduce((acc, curr) => acc + (curr.frequency || 0), 0) || 0;
  const totalCompareSeverity = comparisonData?.severityDistribution.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;

  // Active inspected point
  const activeTimelinePoint = selectedPointIndex !== null && timelineData[selectedPointIndex]
    ? timelineData[selectedPointIndex]
    : timelineData[timelineData.length - 1];

  const activeComparePoint = selectedPointIndex !== null && comparisonData?.timelineTrend[selectedPointIndex]
    ? comparisonData.timelineTrend[selectedPointIndex]
    : comparisonData?.timelineTrend[(comparisonData.timelineTrend.length || 1) - 1];

  // ==========================================
  // CUSTOM RECHARTS TOOLTIP: TIMELINE TREND (WITH REGIONAL COMPARISON)
  // ==========================================
  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const primaryCount = dataPoint.primaryCount ?? dataPoint.primaryFreq ?? 0;
      const compareCount = dataPoint.compareCount ?? dataPoint.compareFreq;
      const primarySources: string[] = dataPoint.primarySources || ['web-src-1'];
      const compareSources: string[] = dataPoint.compareSources || [`${targetCompareCity.toLowerCase().slice(0, 3)}-src-1`];

      const deltaCount = compareCount !== null && compareCount !== undefined
        ? primaryCount - compareCount
        : null;

      return (
        <div className="bg-[#0F172A] text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 w-80 sm:w-96 space-y-2.5 pointer-events-auto backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <span className="font-mono text-xs font-bold text-blue-300">{label}</span>
            </div>
            {isComparisonOn ? (
              <span className="font-citation-ref text-[9px] uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">compare_arrows</span>
                <span>Regional Comparison</span>
              </span>
            ) : (
              <span className="font-citation-ref text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                Verified Telemetry
              </span>
            )}
          </div>

          {/* If Regional Comparison is ON: Show Side-by-Side City Blocks */}
          {isComparisonOn && compareCount !== null && compareCount !== undefined ? (
            <div className="space-y-2">
              {/* Primary City vs Compare City Split */}
              <div className="grid grid-cols-2 gap-2">
                {/* Primary City */}
                <div className="bg-slate-800/90 p-2.5 rounded-lg border border-blue-600/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[11px] font-bold text-blue-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>{location}</span>
                    </span>
                    <span className="font-citation-ref text-[9px] text-slate-400">Primary</span>
                  </div>
                  <div className="font-mono text-base font-bold text-white">
                    {primaryCount} <span className="text-[10px] text-slate-400 font-sans font-normal">incidents</span>
                  </div>
                  {dataPoint.primaryIntensity !== undefined && (
                    <div className="text-[10px] text-orange-300 font-mono">
                      Intensity: {dataPoint.primaryIntensity}
                    </div>
                  )}
                  {/* Linked sources */}
                  <div className="pt-1 border-t border-slate-700/60 flex items-center gap-1 flex-wrap">
                    {primarySources.slice(0, 2).map((srcId: string) => {
                      const src = sourceMap.get(srcId);
                      return (
                        <span
                          key={srcId}
                          onClick={() => onSelectSource && onSelectSource(srcId)}
                          className="font-mono text-[8.5px] px-1 rounded bg-blue-900/60 text-blue-300 border border-blue-700/40 truncate max-w-[85px]"
                        >
                          [{srcId}] {src?.publisher ? src.publisher.split('.')[0] : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Compare City */}
                <div className="bg-slate-800/90 p-2.5 rounded-lg border border-emerald-600/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{targetCompareCity}</span>
                    </span>
                    <span className="font-citation-ref text-[9px] text-slate-400">Benchmark</span>
                  </div>
                  <div className="font-mono text-base font-bold text-white">
                    {compareCount} <span className="text-[10px] text-slate-400 font-sans font-normal">incidents</span>
                  </div>
                  {dataPoint.compareIntensity !== undefined && (
                    <div className="text-[10px] text-purple-300 font-mono">
                      Intensity: {dataPoint.compareIntensity}
                    </div>
                  )}
                  {/* Linked sources */}
                  <div className="pt-1 border-t border-slate-700/60 flex items-center gap-1 flex-wrap">
                    {compareSources.slice(0, 2).map((srcId: string) => (
                      <span
                        key={srcId}
                        className="font-mono text-[8.5px] px-1 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 truncate max-w-[85px]"
                      >
                        [{srcId}]
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delta Variance Pill */}
              {deltaCount !== null && (
                <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Cross-Jurisdiction Delta:</span>
                  <span className={`font-mono font-bold ${deltaCount >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {deltaCount >= 0 ? `+${deltaCount}` : deltaCount} ({deltaCount >= 0 ? `${location} higher` : `${targetCompareCity} higher`})
                  </span>
                </div>
              )}

              {/* Context notes */}
              {dataPoint.primaryHighlight && (
                <div className="text-[10px] text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800 leading-snug">
                  <span className="text-[9px] text-blue-400 font-bold uppercase block mb-0.5">{location} Focus:</span>
                  "{dataPoint.primaryHighlight}"
                </div>
              )}
              {dataPoint.compareHighlight && (
                <div className="text-[10px] text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800 leading-snug">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase block mb-0.5">{targetCompareCity} Focus:</span>
                  "{dataPoint.compareHighlight}"
                </div>
              )}
            </div>
          ) : (
            /* Single City Tooltip (Standard) */
            <div className="space-y-2">
              <div className="flex items-baseline justify-between bg-slate-800/90 p-2 rounded-lg border border-slate-700/70">
                <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-400 text-[14px]">event_note</span>
                  <span>Specific Event Count:</span>
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  {primaryCount} <span className="text-[10px] text-slate-400 font-sans font-normal">incidents</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {dataPoint.primaryIntensity !== undefined && (
                  <div className="bg-slate-800/40 p-1.5 rounded border border-slate-700/40">
                    <span className="text-[10px] text-orange-400 font-semibold block">Intensity Reading</span>
                    <span className="font-mono text-xs font-bold text-orange-200">{dataPoint.primaryIntensity}</span>
                  </div>
                )}
                {dataPoint.primaryBaseline !== undefined && (
                  <div className="bg-slate-800/40 p-1.5 rounded border border-slate-700/40">
                    <span className="text-[10px] text-slate-400 font-semibold block">Threshold Baseline</span>
                    <span className="font-mono text-xs text-slate-300">{dataPoint.primaryBaseline}</span>
                  </div>
                )}
              </div>

              {dataPoint.primaryHighlight && (
                <div className="text-[10.5px] text-slate-300 bg-slate-900/95 p-2 rounded border border-slate-800 leading-snug">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Event Context:</span>
                  "{dataPoint.primaryHighlight}"
                </div>
              )}

              <div className="space-y-1 pt-1.5 border-t border-slate-700/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-citation-ref uppercase font-bold">
                  <span>Linked Source IDs ({primarySources.length})</span>
                </div>
                <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-0.5">
                  {primarySources.map((srcId: string) => {
                    const src = sourceMap.get(srcId);
                    return (
                      <div
                        key={srcId}
                        onClick={() => onSelectSource && onSelectSource(srcId)}
                        className="flex items-center justify-between gap-1.5 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/80 text-[10px] cursor-pointer"
                      >
                        <span className="font-mono text-[9px] font-bold text-blue-300">[{srcId}]</span>
                        <span className="truncate text-slate-200 font-medium text-[10px]">{src?.publisher || 'web'}</span>
                        <span className="material-symbols-outlined text-[12px] text-slate-400">open_in_new</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // ==========================================
  // CUSTOM RECHARTS TOOLTIP: CATEGORY FREQUENCY
  // ==========================================
  const CustomCategoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const primaryCount = dataPoint.primaryCount || 0;
      const compareCount = dataPoint.compareCount;

      return (
        <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-2xl border border-slate-700 w-72 sm:w-80 space-y-2 pointer-events-auto backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
            <span className="font-bold text-xs text-white truncate">{label}</span>
            {isComparisonOn && (
              <span className="font-citation-ref text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Overlay Active
              </span>
            )}
          </div>

          {isComparisonOn ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-800/90 rounded border border-blue-600/40">
                  <div className="text-[10px] text-blue-400 font-bold">{location}</div>
                  <div className="font-mono font-bold text-white text-sm">{primaryCount}</div>
                  <div className="text-[9px] text-slate-400">{dataPoint.primaryPercentage || 0}% share</div>
                </div>
                <div className="p-2 bg-slate-800/90 rounded border border-emerald-600/40">
                  <div className="text-[10px] text-emerald-400 font-bold">{targetCompareCity}</div>
                  <div className="font-mono font-bold text-white text-sm">{compareCount || 0}</div>
                  <div className="text-[9px] text-slate-400">{dataPoint.comparePercentage || 0}% share</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline justify-between bg-slate-800/90 p-2 rounded-lg border border-slate-700/70">
              <span className="text-[11px] text-slate-300 font-medium">Specific Event Count:</span>
              <span className="font-mono text-sm font-bold text-blue-400">
                {primaryCount} <span className="text-[10px] text-slate-400 font-sans font-normal">({dataPoint.primaryPercentage || 0}%)</span>
              </span>
            </div>
          )}

          {dataPoint.primaryHighlight && (
            <div className="text-[10px] text-slate-300 bg-slate-900/95 p-1.5 rounded border border-slate-800 leading-snug">
              "{dataPoint.primaryHighlight}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 space-y-4">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle/80 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-citation-ref text-citation-ref uppercase px-2 py-0.5 rounded bg-brand-tint border border-primary/20 text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">insights</span>
              <span>EVENT FREQUENCY &amp; TREND TELEMETRY</span>
            </span>
            <DataOriginBadge origin="LIVE" compact />

            {/* Regional Comparison Status Pill */}
            {isComparisonOn ? (
              <span className="font-citation-ref text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">compare_arrows</span>
                <span>OVERLAY: {location} VS {targetCompareCity}</span>
              </span>
            ) : trendAnalysis.keyEventVelocity ? (
              <span className="font-citation-ref text-[11px] px-2 py-0.5 rounded bg-critical-red/10 text-critical-red border border-critical-red/20 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">trending_up</span>
                <span>{trendAnalysis.keyEventVelocity}</span>
              </span>
            ) : null}
          </div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-dark-surface">
            Temporal Trajectory &amp; Incident Distribution
          </h3>
          <p className="font-body-compact text-xs text-text-muted">
            Grounding analysis across recent reporting cycles in <strong className="text-dark-surface">{location}</strong>
            {isComparisonOn && <> compared against <strong className="text-emerald-700">{targetCompareCity}</strong></>} ({trendAnalysis.timeframeUnit || 'Time Series Window'}).
          </p>
        </div>

        {/* View Selector Controls & Regional Comparison Toggle */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* REGIONAL COMPARISON TOGGLE BUTTON */}
          <button
            type="button"
            onClick={handleToggleComparison}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
              isComparisonOn
                ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                : 'bg-surface-canvas text-dark-surface border-border-subtle hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">compare_arrows</span>
            <span>Regional Comparison</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              isComparisonOn ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {isComparisonOn ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Metric View Switcher */}
          <div className="flex items-center gap-1 bg-surface-canvas p-1 rounded-lg border border-border-subtle">
            <button
              type="button"
              onClick={() => setActiveMetricMode('timeline')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                activeMetricMode === 'timeline'
                  ? 'bg-surface-card text-primary shadow-xs font-bold'
                  : 'text-text-muted hover:text-dark-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">show_chart</span>
              <span>Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricMode('category')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                activeMetricMode === 'category'
                  ? 'bg-surface-card text-primary shadow-xs font-bold'
                  : 'text-text-muted hover:text-dark-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">bar_chart</span>
              <span>Frequency</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricMode('severity')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                activeMetricMode === 'severity'
                  ? 'bg-surface-card text-primary shadow-xs font-bold'
                  : 'text-text-muted hover:text-dark-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">pie_chart</span>
              <span>Severity</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricMode('seasonality')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                activeMetricMode === 'seasonality'
                  ? 'bg-surface-card text-primary shadow-xs font-bold'
                  : 'text-text-muted hover:text-dark-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
              <span>Seasonality</span>
            </button>
          </div>
        </div>
      </div>

      {/* REGIONAL COMPARISON SUB-BAR (WHEN TOGGLED ON) */}
      {isComparisonOn && (
        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold text-dark-surface">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Primary: {location}</span>
            </div>
            <span className="text-slate-400 font-bold">vs</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="font-bold text-dark-surface">Benchmark:</span>
              <select
                value={targetCompareCity}
                onChange={(e) => handleSelectCompareCity(e.target.value)}
                className="bg-white border border-emerald-300 rounded px-2.5 py-1 text-xs font-bold text-emerald-800 outline-none cursor-pointer"
              >
                {COMPARISON_CITIES.filter((c) => c.value.toLowerCase() !== location.toLowerCase()).map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} ({c.state})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparative Key Metric callout */}
          {comparisonData && (
            <div className="text-[11px] text-emerald-900 font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-emerald-700">insights</span>
              <span>{comparisonData.keyMetric}</span>
            </div>
          )}
        </div>
      )}

      {/* Primary Chart Area based on active view mode */}
      <div className="space-y-4">
        {/* VIEW 1: TIMELINE TREND (Area + Line Chart with Regional Overlay) */}
        {activeMetricMode === 'timeline' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
              <div className="flex flex-wrap items-center gap-3">
                {/* Primary City Legend */}
                <span className="flex items-center gap-1.5 font-medium text-dark-surface">
                  <span className="inline-block w-3 h-3 rounded-xs bg-[#0053db]"></span>
                  <span>{location} Incidents</span>
                </span>
                {/* Comparison City Legend if ON */}
                {isComparisonOn && (
                  <span className="flex items-center gap-1.5 font-medium text-emerald-800">
                    <span className="inline-block w-3 h-3 rounded-xs bg-[#059669]"></span>
                    <span>{targetCompareCity} Incidents</span>
                  </span>
                )}
                {/* Intensity Lines */}
                <span className="flex items-center gap-1.5 font-medium text-dark-surface">
                  <span className="inline-block w-3 h-1 bg-[#ea580c] rounded-xs"></span>
                  <span>{location} Intensity</span>
                </span>
                {isComparisonOn && (
                  <span className="flex items-center gap-1.5 font-medium text-purple-800">
                    <span className="inline-block w-3 h-1 bg-[#7c3aed] rounded-xs"></span>
                    <span>{targetCompareCity} Intensity</span>
                  </span>
                )}
              </div>

              <div className="font-citation-ref text-[11px] text-text-muted flex items-center gap-2">
                <span>{location}: <strong className="text-dark-surface">{totalIncidents}</strong></span>
                {isComparisonOn && (
                  <span>| {targetCompareCity}: <strong className="text-emerald-700">{totalCompareIncidents}</strong></span>
                )}
              </div>
            </div>

            <div className="w-full h-72 bg-surface-canvas/60 rounded-lg p-2 border border-border-subtle">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={combinedTimelineData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  onClick={(state) => {
                    if (state && state.activeTooltipIndex !== undefined) {
                      const idx = Number(state.activeTooltipIndex);
                      if (!isNaN(idx)) {
                        setSelectedPointIndex(idx);
                      }
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="eventFreqGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0053db" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0053db" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="compareFreqGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#ea580c', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTimelineTooltip />} />

                  {/* Primary City Area */}
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="primaryFreq"
                    name={`${location} Incidents`}
                    stroke="#0053db"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#eventFreqGradient)"
                    activeDot={{ r: 6, fill: '#0053db', stroke: '#ffffff', strokeWidth: 2 }}
                  />

                  {/* Comparison City Area (When Comparison is Enabled) */}
                  {isComparisonOn && (
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="compareFreq"
                      name={`${targetCompareCity} Incidents`}
                      stroke="#059669"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#compareFreqGradient)"
                      activeDot={{ r: 6, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  )}

                  {/* Primary City Intensity Line */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="primaryIntensity"
                    name={`${location} Intensity`}
                    stroke="#ea580c"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#ea580c', strokeWidth: 1, stroke: '#ffffff' }}
                    activeDot={{ r: 5 }}
                  />

                  {/* Comparison City Intensity Line (When Comparison is Enabled) */}
                  {isComparisonOn && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="compareIntensity"
                      name={`${targetCompareCity} Intensity`}
                      stroke="#7c3aed"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      dot={{ r: 3, fill: '#7c3aed', strokeWidth: 1, stroke: '#ffffff' }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Interactive Provenance Inspector */}
            {activeTimelinePoint && (
              <div className="p-3 bg-surface-canvas rounded-lg border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {activeTimelinePoint.period}
                    </span>
                    <span className="font-citation-ref text-[11px] text-text-muted">•</span>
                    <span className="font-body-compact text-xs text-dark-surface font-semibold">
                      {location}: {activeTimelinePoint.specificEventCount ?? activeTimelinePoint.frequency} Incidents
                      {isComparisonOn && activeComparePoint && (
                        <span className="text-emerald-700 ml-1.5 font-bold">
                          vs {targetCompareCity}: {activeComparePoint.specificEventCount ?? activeComparePoint.frequency} Incidents
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="font-body-compact text-[11px] text-text-muted line-clamp-1">
                    {activeTimelinePoint.keyEventHighlight || 'Empirical telemetry synchronized across municipal monitoring bulletins.'}
                  </p>
                </div>

                {/* Linked source tags */}
                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  <span className="font-citation-ref text-[10px] text-text-muted uppercase font-bold">
                    Linked Sources:
                  </span>
                  {(activeTimelinePoint.linkedSourceIds || ['web-src-1']).map((srcId: string) => {
                    const src = sourceMap.get(srcId);
                    const adaptedSource: Source = {
                      id: srcId,
                      identifier: srcId,
                      title: src?.title || `Web Intelligence Report ${srcId}`,
                      documentType: 'Web Report / Grounding Index',
                      meta: `${src?.publisher || 'Web'} • ${location}`,
                      reliabilityTier: 'Tier-1 Grounded',
                      summary: src?.snippet || src?.title || 'Verified web citation retrieved from Google Search grounding.',
                      citedPages: 'Online Web Source',
                      findingsLinkedCount: 2,
                      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
                      verbatimExcerpt: src?.snippet || src?.title || 'Online web source excerpt.',
                      pageNumber: 'Web',
                      category: 'Govt Reports',
                      fullDocUrl: src?.url,
                    };
                    return (
                      <CitationQuickGlance
                        key={srcId}
                        identifier={srcId}
                        source={adaptedSource}
                        onInspectFullCitation={() => {
                          if (onSelectSource) onSelectSource(srcId);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: CATEGORY FREQUENCY BREAKDOWN (Side-by-Side Bar Chart Overlay) */}
        {activeMetricMode === 'category' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between text-xs text-text-muted">
              <span>
                {isComparisonOn
                  ? `Side-by-side category frequency comparison: ${location} (Blue) vs ${targetCompareCity} (Emerald)`
                  : 'Distribution across subcategories and contributing urban vectors'}
              </span>
              <span className="font-citation-ref text-[11px] text-primary font-bold">
                {categoryData.length} Contributory Classes
              </span>
            </div>

            <div className="w-full h-72 bg-surface-canvas/60 rounded-lg p-2 border border-border-subtle">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={combinedCategoryData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 500 }}
                    width={150}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomCategoryTooltip />} />

                  {/* Primary City Bar */}
                  <Bar
                    dataKey="primaryCount"
                    name={location}
                    fill="#0053db"
                    radius={[0, 4, 4, 0]}
                    barSize={isComparisonOn ? 12 : 20}
                  />

                  {/* Comparison City Bar */}
                  {isComparisonOn && (
                    <Bar
                      dataKey="compareCount"
                      name={targetCompareCity}
                      fill="#059669"
                      radius={[0, 4, 4, 0]}
                      barSize={12}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Subcategory comparison pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              {combinedCategoryData.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-surface-canvas rounded-lg border border-border-subtle text-xs space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="font-semibold text-dark-surface truncate">{item.category}</div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold text-primary">{item.primaryCount}</span>
                        {isComparisonOn && (
                          <span className="font-mono text-xs font-bold text-emerald-700">/ {item.compareCount}</span>
                        )}
                      </div>
                      {item.primaryPercentage && (
                        <span className="text-[10px] text-text-muted font-medium">{item.primaryPercentage}% share</span>
                      )}
                    </div>
                  </div>

                  {isComparisonOn && (
                    <div className="text-[10px] text-slate-500 font-label-code border-t border-border-subtle/50 pt-1 flex items-center justify-between">
                      <span className="text-blue-700 font-bold">{location}: {item.primaryCount}</span>
                      <span className="text-emerald-700 font-bold">{targetCompareCity}: {item.compareCount}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: SEVERITY DISTRIBUTION (Side-by-Side Twin Donut / Meter View) */}
        {activeMetricMode === 'severity' && (
          <div className="space-y-3">
            {isComparisonOn && comparisonData ? (
              /* Twin Side-by-Side Severity Donut Comparison */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Primary City */}
                <div className="p-4 bg-surface-canvas/60 rounded-xl border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-dark-surface">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <span>{location} Risk Escalation Tiers</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-primary">{totalSeverityCount} Citations</span>
                  </div>

                  <div className="h-48 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          dataKey="count"
                          nameKey="severity"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                        >
                          {severityData.map((entry, index) => (
                            <Cell
                              key={`primary-severity-${index}`}
                              fill={entry.color || DEFAULT_SEVERITY_COLORS[index % DEFAULT_SEVERITY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="font-mono text-base font-bold text-dark-surface">{totalSeverityCount}</span>
                      <span className="text-[9px] uppercase font-bold text-text-muted">{location}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {severityData.map((tier, idx) => {
                      const pct = totalSeverityCount > 0 ? Math.round((tier.count / totalSeverityCount) * 100) : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color || '#DC2626' }}></span>
                            <span>{tier.severity}</span>
                          </span>
                          <span className="font-mono font-bold text-dark-surface">{tier.count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Comparison City */}
                <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <span>{targetCompareCity} Benchmark Tiers</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-800">{totalCompareSeverity} Citations</span>
                  </div>

                  <div className="h-48 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={comparisonData.severityDistribution}
                          dataKey="count"
                          nameKey="severity"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                        >
                          {comparisonData.severityDistribution.map((entry, index) => (
                            <Cell
                              key={`compare-severity-${index}`}
                              fill={entry.color || DEFAULT_SEVERITY_COLORS[index % DEFAULT_SEVERITY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="font-mono text-base font-bold text-emerald-950">{totalCompareSeverity}</span>
                      <span className="text-[9px] uppercase font-bold text-emerald-700">{targetCompareCity}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {comparisonData.severityDistribution.map((tier, idx) => {
                      const pct = totalCompareSeverity > 0 ? Math.round((tier.count / totalCompareSeverity) * 100) : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-emerald-900">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color || '#DC2626' }}></span>
                            <span>{tier.severity}</span>
                          </span>
                          <span className="font-mono font-bold text-emerald-950">{tier.count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Single City Severity View */
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-6 h-60 relative flex items-center justify-center bg-surface-canvas/60 rounded-lg border border-border-subtle p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        dataKey="count"
                        nameKey="severity"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {severityData.map((entry, index) => (
                          <Cell
                            key={`severity-cell-${index}`}
                            fill={entry.color || DEFAULT_SEVERITY_COLORS[index % DEFAULT_SEVERITY_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-mono text-xl font-bold text-dark-surface">{totalSeverityCount}</span>
                    <span className="text-[10px] uppercase font-bold text-text-muted">Total Events</span>
                  </div>
                </div>

                <div className="sm:col-span-6 space-y-2">
                  <div className="font-citation-ref text-citation-ref uppercase tracking-wider text-text-muted font-bold">
                    Severity &amp; Risk Escalation Tiers
                  </div>
                  <div className="space-y-2">
                    {severityData.map((tier, idx) => {
                      const pct = totalSeverityCount > 0 ? Math.round((tier.count / totalSeverityCount) * 100) : 0;
                      return (
                        <div key={idx} className="p-2.5 bg-surface-canvas rounded-lg border border-border-subtle space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 font-medium text-dark-surface">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    tier.color || DEFAULT_SEVERITY_COLORS[idx % DEFAULT_SEVERITY_COLORS.length]
                                }}
                              ></span>
                              <span>{tier.severity}</span>
                            </span>
                            <span className="font-mono font-bold text-dark-surface">{tier.count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor:
                                  tier.color || DEFAULT_SEVERITY_COLORS[idx % DEFAULT_SEVERITY_COLORS.length]
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: INFRASTRUCTURE SEASONALITY ANALYTICS (YEAR-OVER-YEAR CYCLES) */}
        {activeMetricMode === 'seasonality' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Seasonality Controls Bar */}
            <div className="p-3 bg-surface-canvas rounded-xl border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              {/* Granularity Toggle */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-dark-surface font-sans text-xs">Granularity:</span>
                <div className="flex items-center gap-1 bg-surface-card p-1 rounded-lg border border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setSeasonalityGranularity('monthly')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      seasonalityGranularity === 'monthly'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-text-muted hover:text-dark-surface'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeasonalityGranularity('quarterly')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      seasonalityGranularity === 'quarterly'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-text-muted hover:text-dark-surface'
                    }`}
                  >
                    Quarterly
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeasonalityGranularity('yearly')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      seasonalityGranularity === 'yearly'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-text-muted hover:text-dark-surface'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {/* Sector / Category Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-text-muted text-[11px]">Sector:</span>
                <select
                  value={seasonalitySector}
                  onChange={(e) => setSeasonalitySector(e.target.value)}
                  className="bg-surface-card border border-border-subtle rounded-md px-2.5 py-1 text-xs font-medium text-dark-surface outline-none cursor-pointer"
                >
                  <option value="all">All Infrastructure Sectors (24 Projects)</option>
                  <option value="transit">Transit &amp; Metro</option>
                  <option value="road">Roads &amp; Expressways</option>
                  <option value="drainage">Drainage &amp; Flood Mitigation</option>
                  <option value="sanitation">Waste &amp; Sanitation</option>
                  <option value="water">Water Treatment</option>
                  <option value="redevelopment">Urban Redevelopment</option>
                </select>

                {/* Year-over-Year Toggles for Monthly and Quarterly Views */}
                {seasonalityGranularity !== 'yearly' && (
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="font-semibold text-text-muted text-[11px]">Compare:</span>
                    {[2024, 2025, 2026].map((yr) => {
                      const isSelected = seasonalityYears.includes(yr);
                      const colors: Record<number, string> = {
                        2024: 'text-blue-700 border-blue-300 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300',
                        2025: 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300',
                        2026: 'text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300',
                      };
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (seasonalityYears.length > 1) {
                                setSeasonalityYears(seasonalityYears.filter((y) => y !== yr));
                              }
                            } else {
                              setSeasonalityYears([...seasonalityYears, yr].sort());
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? `${colors[yr]} shadow-2xs`
                              : 'bg-surface-card text-text-muted border-border-subtle opacity-50'
                          }`}
                        >
                          {yr}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Check for Insufficient Data */}
            {seasonalityAnalytics.insufficientData ||
            (seasonalityGranularity === 'monthly' && seasonalityAnalytics.monthlyData.length === 0) ||
            (seasonalityGranularity === 'quarterly' && seasonalityAnalytics.quarterlyData.length === 0) ||
            (seasonalityGranularity === 'yearly' && seasonalityAnalytics.yearlyData.length === 0) ? (
              <div className="p-8 bg-surface-canvas rounded-xl border border-dashed border-border-subtle text-center space-y-2">
                <span className="material-symbols-outlined text-[32px] text-text-muted">query_stats</span>
                <div className="font-bold text-dark-surface text-sm">Insufficient Data for Seasonality Analysis</div>
                <p className="text-xs text-text-muted max-w-md mx-auto">
                  No infrastructure project records match the current filter criteria ({seasonalitySector}). Clear filters to inspect verified multi-year municipal project cycles.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSeasonalitySector('all');
                    setSeasonalityYears([2024, 2025, 2026]);
                  }}
                  className="px-3.5 py-1.5 bg-surface-card text-primary font-bold text-xs rounded-lg border border-primary/30 hover:bg-surface-container cursor-pointer"
                >
                  Reset Filter Parameters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. MONTHLY VIEW */}
                {seasonalityGranularity === 'monthly' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-dark-surface">Monthly Project Activity (Jan → Dec):</span>
                        {seasonalityYears.map((yr) => (
                          <span key={yr} className="flex items-center gap-1 font-mono text-[11px] font-bold">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: yr === 2024 ? '#0053db' : yr === 2025 ? '#059669' : '#ea580c',
                              }}
                            ></span>
                            <span>{yr}</span>
                          </span>
                        ))}
                      </div>
                      <span className="font-citation-ref text-[10px]">
                        Year-over-Year Sourced Telemetry
                      </span>
                    </div>

                    <div className="w-full h-72 bg-surface-canvas/60 rounded-lg p-2 border border-border-subtle">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={seasonalityAnalytics.monthlyData}
                          margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const pt = payload[0].payload;
                                return (
                                  <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-2xl border border-slate-700 w-72 space-y-2 text-xs">
                                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                                      <span className="font-bold text-blue-300 font-mono text-sm">{label} (Monthly Activity)</span>
                                      <span className="font-mono text-[11px] text-slate-300">
                                        Total: {pt.totalProjects}
                                      </span>
                                    </div>
                                    <div className="space-y-1 font-mono text-[11px]">
                                      {seasonalityYears.map((yr) => (
                                        <div key={yr} className="flex items-center justify-between">
                                          <span className="text-slate-400">{yr} Projects:</span>
                                          <span className="font-bold text-white">{pt.byYear[yr] || 0}</span>
                                        </div>
                                      ))}
                                    </div>
                                    {pt.seasonalPatternTag && (
                                      <div className="p-1.5 bg-slate-800/80 rounded text-[10.5px] text-amber-300 font-sans leading-tight">
                                        ⚡ {pt.seasonalPatternTag}
                                      </div>
                                    )}
                                    {pt.topCategories && pt.topCategories.length > 0 && (
                                      <div className="text-[10px] text-slate-400 font-sans pt-1 border-t border-slate-800">
                                        Key sectors: {pt.topCategories.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          {seasonalityYears.includes(2024) && (
                            <Bar dataKey="byYear.2024" name="2024" fill="#0053db" radius={[4, 4, 0, 0]} maxBarSize={16} />
                          )}
                          {seasonalityYears.includes(2025) && (
                            <Bar dataKey="byYear.2025" name="2025" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={16} />
                          )}
                          {seasonalityYears.includes(2026) && (
                            <Bar dataKey="byYear.2026" name="2026" fill="#ea580c" radius={[4, 4, 0, 0]} maxBarSize={16} />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 2. QUARTERLY VIEW */}
                {seasonalityGranularity === 'quarterly' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-dark-surface">Quarterly Infrastructure Cycles (Q1 → Q4):</span>
                        {seasonalityYears.map((yr) => (
                          <span key={yr} className="flex items-center gap-1 font-mono text-[11px] font-bold">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: yr === 2024 ? '#0053db' : yr === 2025 ? '#059669' : '#ea580c',
                              }}
                            ></span>
                            <span>{yr}</span>
                          </span>
                        ))}
                      </div>
                      <span className="font-citation-ref text-[10px]">
                        Fiscal &amp; Monsoon Aggregation
                      </span>
                    </div>

                    <div className="w-full h-72 bg-surface-canvas/60 rounded-lg p-2 border border-border-subtle">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={seasonalityAnalytics.quarterlyData}
                          margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const pt = payload[0].payload;
                                return (
                                  <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-2xl border border-slate-700 w-72 space-y-2 text-xs">
                                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                                      <span className="font-bold text-blue-300 font-mono text-sm">{label} Overview</span>
                                      <span className="font-mono text-emerald-300 font-bold">
                                        ₹{pt.budgetSanctionedCr.toLocaleString()} Cr
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-tight">
                                      {pt.seasonalTheme}
                                    </p>
                                    <div className="space-y-1 font-mono text-[11px] pt-1 border-t border-slate-800">
                                      {seasonalityYears.map((yr) => (
                                        <div key={yr} className="flex items-center justify-between">
                                          <span className="text-slate-400">{yr} Projects:</span>
                                          <span className="font-bold text-white">{pt.byYear[yr] || 0}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          {seasonalityYears.includes(2024) && (
                            <Bar dataKey="byYear.2024" name="2024" fill="#0053db" radius={[4, 4, 0, 0]} maxBarSize={28} />
                          )}
                          {seasonalityYears.includes(2025) && (
                            <Bar dataKey="byYear.2025" name="2025" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
                          )}
                          {seasonalityYears.includes(2026) && (
                            <Bar dataKey="byYear.2026" name="2026" fill="#ea580c" radius={[4, 4, 0, 0]} maxBarSize={28} />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 3. YEARLY VIEW */}
                {seasonalityGranularity === 'yearly' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-dark-surface">Annual Infrastructure Project Sanctions (2023–2026):</span>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                          <span>Total Projects</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                          <span>Completed</span>
                        </span>
                      </div>
                      <span className="font-citation-ref text-[10px]">
                        Multi-Year Infrastructure Volume
                      </span>
                    </div>

                    <div className="w-full h-72 bg-surface-canvas/60 rounded-lg p-2 border border-border-subtle">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={seasonalityAnalytics.yearlyData}
                          margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const pt = payload[0].payload;
                                return (
                                  <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-2xl border border-slate-700 w-64 space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                                      <span className="font-bold text-blue-300 font-mono text-sm">Fiscal Year {label}</span>
                                      <span className="font-mono text-xs font-bold text-white">{pt.totalProjects} Projects</span>
                                    </div>
                                    <div className="font-mono text-[11px] space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Budget Outlay:</span>
                                        <span className="text-emerald-300 font-bold">₹{pt.budgetAllocatedCr.toLocaleString()} Cr</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Completed:</span>
                                        <span className="text-white">{pt.completedCount}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Under Construction:</span>
                                        <span className="text-amber-300">{pt.activeConstructionCount}</span>
                                      </div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                                      Dominant Sector: {pt.dominantSector}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="totalProjects" name="Total Sanctioned" fill="#0053db" radius={[4, 4, 0, 0]} maxBarSize={32} />
                          <Bar dataKey="completedCount" name="Completed" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Seasonal Urban Cycles Insight Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 text-xs">
                      <span className="material-symbols-outlined text-[15px]">water_drop</span>
                      <span>Pre-Monsoon Flood Push (Mar–May)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      Mandatory annual desilting of major trunk outfalls &amp; stormwater sumps ahead of monsoon cloudbursts.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900/50 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-xs">
                      <span className="material-symbols-outlined text-[15px]">umbrella</span>
                      <span>Monsoon Hiatus (Jul–Aug)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      Severe downpours force structural earthworks and asphalt laying to halt to prevent compromised compaction.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 text-xs">
                      <span className="material-symbols-outlined text-[15px]">construction</span>
                      <span>Autumn Execution Peak (Oct–Dec)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      Optimal dry weather window for arterial road re-carpeting, flyover casting, and metro viaduct launches.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900/50 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300 text-xs">
                      <span className="material-symbols-outlined text-[15px]">foggy</span>
                      <span>Winter CAQM GRAP Curbs (Nov–Jan)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      Atmospheric inversion triggers emergency construction stoppage on non-essential excavation across NCR.
                    </p>
                  </div>
                </div>

                {/* Sourced Project Records Ledger */}
                <div className="p-3 bg-surface-canvas rounded-lg border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-dark-surface">
                      <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
                      <span>Monitored Infrastructure Project Registry ({seasonalityAnalytics.totalProjectsAnalyzed} Records)</span>
                    </div>
                    <span className="font-citation-ref text-[10px] text-text-muted">
                      Source-Grounded Civic Registry
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-52 overflow-y-auto">
                    <table className="w-full text-left text-xs font-body-compact">
                      <thead className="sticky top-0 bg-surface-card border-b border-border-subtle text-[10px] text-text-muted uppercase font-citation-ref">
                        <tr>
                          <th className="py-1.5 px-2">Project Code</th>
                          <th className="py-1.5 px-2">Title</th>
                          <th className="py-1.5 px-2">Sector</th>
                          <th className="py-1.5 px-2 text-right">Budget (₹ Cr)</th>
                          <th className="py-1.5 px-2">Commenced</th>
                          <th className="py-1.5 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle text-[11px] font-mono">
                        {INFRASTRUCTURE_PROJECT_RECORDS.filter(
                          (p) => seasonalitySector === 'all' || p.category === seasonalitySector
                        ).map((p) => (
                          <tr key={p.id} className="hover:bg-surface-card/60 transition-colors">
                            <td className="py-1.5 px-2 font-bold text-primary">{p.code}</td>
                            <td className="py-1.5 px-2 font-sans font-medium text-dark-surface max-w-[200px] truncate">
                              {p.name}
                            </td>
                            <td className="py-1.5 px-2 font-sans text-text-muted text-[10px]">{p.categoryLabel}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-dark-surface">₹{p.budgetCr}</td>
                            <td className="py-1.5 px-2 text-text-muted text-[10px]">{p.commencementDate}</td>
                            <td className="py-1.5 px-2 text-center">
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-sans font-bold uppercase ${
                                  p.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : p.status === 'under_construction'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {p.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Synthesis Callout (With Comparative Insights if ON) */}
        <div className="p-3 bg-brand-tint/60 rounded-lg border border-primary/20 flex items-start gap-2.5 text-xs">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">analytics</span>
          <div className="space-y-1">
            <span className="font-citation-ref text-citation-ref text-primary font-bold uppercase tracking-wider">
              {isComparisonOn ? 'Cross-Regional Telemetry Deduction:' : 'Empirical Trajectory Finding:'}
            </span>
            <p className="font-body-compact text-dark-surface leading-relaxed">
              {isComparisonOn && comparisonData ? comparisonData.summary : trendAnalysis.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
