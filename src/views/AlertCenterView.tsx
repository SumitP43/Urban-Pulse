import React, { useState, useEffect, useMemo } from 'react';
import {
  CivicGrievanceLog,
  EmergencyUpdate,
  GrievanceSeverity,
  GrievanceStatus,
  NavigationPath,
  Source,
  SpikeDetectionAlert,
  AgentScanLog,
  GrievanceScanAgentConfig
} from '../types';
import { CitationQuickGlance } from '../components/CitationQuickGlance';
import { DataOriginBadge } from '../components/DataOriginBadge';
import {
  MONITORED_CITIES,
  CityAlertProfile,
  INITIAL_CIVIC_GRIEVANCES,
  INITIAL_EMERGENCY_UPDATES,
  HOURLY_INCIDENT_SURGE_DATA,
  CATEGORY_BREAKDOWN_DATA,
  INITIAL_SPIKE_DETECTIONS,
  DEFAULT_AGENT_SCAN_CONFIG,
  INITIAL_AGENT_SCAN_LOGS
} from '../data/alertCenterData';
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
  Cell
} from 'recharts';

interface AlertCenterViewProps {
  onNavigate: (path: NavigationPath) => void;
  onInspectCitation: (sourceIdOrRef: string) => void;
  onLaunchInvestigation?: (title: string, city: string) => void;
  onLaunchWebSearch?: (query: string, city: string) => void;
  sources?: Source[];
}

export const AlertCenterView: React.FC<AlertCenterViewProps> = ({
  onNavigate,
  onInspectCitation,
  onLaunchInvestigation,
  onLaunchWebSearch,
  sources = []
}) => {
  // Selected City State
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi');
  const selectedCity: CityAlertProfile = useMemo(() => {
    return MONITORED_CITIES.find((c) => c.id === selectedCityId) || MONITORED_CITIES[0];
  }, [selectedCityId]);

  // Grievance and Emergency Lists
  const [grievances, setGrievances] = useState<CivicGrievanceLog[]>(INITIAL_CIVIC_GRIEVANCES);
  const [emergencies, setEmergencies] = useState<EmergencyUpdate[]>(INITIAL_EMERGENCY_UPDATES);

  // Live Telemetry Stream State
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(true);
  const [secondsUntilNextPoll, setSecondsUntilNextPoll] = useState<number>(15);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'sla_breached'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'stream' | 'emergencies' | 'analytics' | 'agent-sentinel'>('stream');

  // Automated Grievance Spike Detection Agent State
  const [agentConfig, setAgentConfig] = useState<GrievanceScanAgentConfig>(DEFAULT_AGENT_SCAN_CONFIG);
  const [spikeAlerts, setSpikeAlerts] = useState<SpikeDetectionAlert[]>(INITIAL_SPIKE_DETECTIONS);
  const [agentScanLogs, setAgentScanLogs] = useState<AgentScanLog[]>(INITIAL_AGENT_SCAN_LOGS);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isAgentConsoleOpen, setIsAgentConsoleOpen] = useState<boolean>(false);
  const [newKeywordInput, setNewKeywordInput] = useState<string>('');
  const [activeSpikeFilter, setActiveSpikeFilter] = useState<string | null>(null);

  // Modal State for inspecting ticket detail
  const [inspectingTicket, setInspectingTicket] = useState<CivicGrievanceLog | null>(null);

  // Modal State for logging a new grievance
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState<boolean>(false);
  const [newTicketForm, setNewTicketForm] = useState({
    ward: 'Ward 14 - Anand Vihar',
    category: 'Air Quality & Emissions',
    department: 'MCD Dept of Environment & DPCC',
    issue: '',
    description: '',
    severity: 'high' as GrievanceSeverity,
    slaHours: 24,
    reportedByCount: 18,
    linkedSourceId: 'SRC-02'
  });

  // Source lookup map
  const sourceLookup = useMemo(() => {
    const map = new Map<string, Source>();
    sources.forEach((s) => map.set(s.identifier, s));
    sources.forEach((s) => map.set(s.id, s));
    return map;
  }, [sources]);

  // Real-time simulated ticker
  useEffect(() => {
    if (!isLiveStreamActive) return;

    const timer = setInterval(() => {
      setSecondsUntilNextPoll((prev) => {
        if (prev <= 1) {
          // Trigger simulated telemetry poll
          setLastUpdatedTime('Just now');
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLiveStreamActive]);

  // Filtered Grievances for selected city
  const cityGrievances = useMemo(() => {
    return grievances.filter((g) => g.city.toLowerCase() === selectedCity.name.toLowerCase());
  }, [grievances, selectedCity]);

  // Filtered Emergencies for selected city
  const cityEmergencies = useMemo(() => {
    return emergencies.filter((e) => e.city.toLowerCase() === selectedCity.name.toLowerCase());
  }, [emergencies, selectedCity]);

  // Active Spike Alerts for selected city
  const citySpikeAlerts = useMemo(() => {
    return spikeAlerts.filter(
      (s) => s.city.toLowerCase() === selectedCity.name.toLowerCase() && s.status === 'active'
    );
  }, [spikeAlerts, selectedCity]);

  // Keyword Frequency Statistics for Analytics & Diagnostics
  const keywordFrequencyStats = useMemo(() => {
    return agentConfig.monitoredKeywords.map((kw) => {
      const kwLower = kw.toLowerCase().trim();
      const count = cityGrievances.filter(
        (g) =>
          g.issue.toLowerCase().includes(kwLower) ||
          g.description.toLowerCase().includes(kwLower) ||
          g.category.toLowerCase().includes(kwLower)
      ).length;
      return {
        keyword: kw,
        count,
        isSpiking: count >= agentConfig.spikeThreshold
      };
    });
  }, [agentConfig.monitoredKeywords, agentConfig.spikeThreshold, cityGrievances]);

  // Proactive Scanning Engine
  const executeAgentScan = (targetGrievances = grievances, targetCity = selectedCity.name) => {
    setIsScanning(true);
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newLogs: AgentScanLog[] = [];
    const detectedSpikes: SpikeDetectionAlert[] = [];

    const cityLogs = targetGrievances.filter((g) => g.city.toLowerCase() === targetCity.toLowerCase());

    agentConfig.monitoredKeywords.forEach((kw) => {
      const kwLower = kw.toLowerCase().trim();
      const matched = cityLogs.filter(
        (g) =>
          g.issue.toLowerCase().includes(kwLower) ||
          g.description.toLowerCase().includes(kwLower) ||
          g.category.toLowerCase().includes(kwLower)
      );

      if (matched.length >= agentConfig.spikeThreshold) {
        const wards = Array.from(new Set(matched.map((m) => m.ward)));
        const citizenCount = matched.reduce((acc, m) => acc + (m.reportedByCount || 10), 0);
        const velocityPct = Math.round(180 + matched.length * 45);

        const existing = spikeAlerts.find(
          (s) =>
            s.city.toLowerCase() === targetCity.toLowerCase() &&
            s.keyword.toLowerCase() === kwLower &&
            s.status === 'active'
        );

        const spikeAlert: SpikeDetectionAlert = existing
          ? {
              ...existing,
              matchedTicketCount: matched.length,
              impactedCitizensEstimate: citizenCount,
              matchedTicketIds: matched.map((m) => m.id),
              relativeTime: 'Just now'
            }
          : {
              id: `spk-${targetCity.toLowerCase().slice(0, 3)}-${kwLower.replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`,
              code: `SPK-${kwLower.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
              city: targetCity,
              keyword: kw,
              patternLabel: `${kw.charAt(0).toUpperCase() + kw.slice(1)} Incident Surge & Municipal Bottleneck`,
              detectedAt: `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} â€¢ ${nowTime} IST`,
              relativeTime: 'Just now',
              matchedTicketCount: matched.length,
              velocityMultiplier: `+${velocityPct}% vs 48h baseline`,
              affectedWards: wards,
              impactedCitizensEstimate: citizenCount,
              severity: matched.length >= 3 ? 'critical' : 'high',
              suggestedResearchQuestion: `Investigate Root Cause of Escalating ${kw.charAt(0).toUpperCase() + kw.slice(1)} Clusters & Infrastructure Failures across ${targetCity}`,
              hypothesis: `Correlating high-density 311 citizen escalations [SRC-02] against spatial GIS demographic vectors [SRC-04] reveals systemic municipal SLA latency exceeding allowable targets by +${velocityPct}%.`,
              linkedSourceIds: ['SRC-02', 'SRC-04', 'web-src-1'],
              matchedTicketIds: matched.map((m) => m.id),
              status: 'active',
              confidenceScore: Math.min(99, 90 + matched.length * 2)
            };

        detectedSpikes.push(spikeAlert);

        newLogs.push({
          id: `log-${Date.now()}-${kwLower}`,
          timestamp: nowTime,
          action: 'SPIKE_TRIGGERED',
          detail: `Proactive scan detected spike in '${kw}' (${matched.length} complaints clustered across ${wards.length} wards). Triggered Research Notification ${spikeAlert.code}.`,
          status: 'spike_detected',
          keyword: kw,
          matchCount: matched.length
        });
      }
    });

    if (detectedSpikes.length > 0) {
      setSpikeAlerts((prev) => {
        const existingIds = new Set(detectedSpikes.map((d) => d.id));
        return [...detectedSpikes, ...prev.filter((p) => !existingIds.has(p.id))];
      });
      showToast(`Agent Sentinel: Detected spike in ${detectedSpikes.map((d) => `'${d.keyword}'`).join(', ')}.`);
    } else {
      newLogs.push({
        id: `log-${Date.now()}`,
        timestamp: nowTime,
        action: 'SCAN_NORMAL',
        detail: `Routine scan completed for ${targetCity} across ${cityLogs.length} tickets. All monitored complaint vectors within baseline thresholds.`,
        status: 'scan'
      });
    }

    setAgentScanLogs((prev) => [...newLogs, ...prev.slice(0, 30)]);
    setTimeout(() => setIsScanning(false), 500);
  };

  // Periodic automated scan execution
  useEffect(() => {
    if (!agentConfig.enabled) return;
    const interval = setInterval(() => {
      executeAgentScan(grievances, selectedCity.name);
    }, agentConfig.scanIntervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [agentConfig.enabled, agentConfig.scanIntervalSeconds, grievances, selectedCityId]);

  // Execute scan when selected city changes
  useEffect(() => {
    executeAgentScan(grievances, selectedCity.name);
    setActiveSpikeFilter(null);
  }, [selectedCityId]);

  // Handlers for Test Spike Injections
  const handleInjectWaterloggingSpike = () => {
    const t1: CivicGrievanceLog = {
      id: `grv-${selectedCity.id}-wtr-${Date.now()}-1`,
      ticketNumber: `#MCD-311-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST',
      relativeTime: 'Just now',
      city: selectedCity.name,
      ward: `${selectedCity.name} Central Transit Underpass`,
      category: 'Water Supply & SCADA',
      department: 'PWD Drainage & Stormwater Cell',
      issue: 'Acute Waterlogging: Inundation Blocking Main Radial Corridor',
      description: 'Severe waterlogging with 3.5 feet standing water accumulation after local cloudburst. Sump pump failure reported.',
      severity: 'critical',
      status: 'active',
      slaHours: 6,
      slaBreached: true,
      slaOverdueHours: 1.0,
      reportedByCount: 145,
      linkedSourceIds: ['SRC-02', 'SRC-04'],
      linkedCitations: ['MCD-311-LIVE'],
      coordinates: selectedCity.coordinates,
      actionTaken: 'Awaiting emergency dewatering pump dispatch.',
      verificationConfidence: 97
    };
    const t2: CivicGrievanceLog = {
      id: `grv-${selectedCity.id}-wtr-${Date.now()}-2`,
      ticketNumber: `#MCD-311-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST',
      relativeTime: 'Just now',
      city: selectedCity.name,
      ward: `${selectedCity.name} Peripheral Ward 18`,
      category: 'Water Supply & SCADA',
      department: 'Municipal Drainage Division',
      issue: 'Stormwater Culvert Choke & Heavy Surface Waterlogging',
      description: 'Runoff backup spilling over 180 meters of roadway; traffic immobilized.',
      severity: 'high',
      status: 'escalated',
      slaHours: 12,
      slaBreached: false,
      reportedByCount: 92,
      linkedSourceIds: ['SRC-02'],
      coordinates: selectedCity.coordinates,
      verificationConfidence: 95
    };
    const updated = [t1, t2, ...grievances];
    setGrievances(updated);
    executeAgentScan(updated, selectedCity.name);
    showToast(`Injected 2 new 'waterlogging' grievances. Agent scanning in progress...`);
  };

  const handleInjectRoadDamageSpike = () => {
    const t1: CivicGrievanceLog = {
      id: `grv-${selectedCity.id}-rds-${Date.now()}-1`,
      ticketNumber: `#PWD-RDS-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST',
      relativeTime: 'Just now',
      city: selectedCity.name,
      ward: `${selectedCity.name} Industrial Corridor Connector`,
      category: 'Roads & Infrastructure',
      department: 'PWD Roads & Bridges',
      issue: 'Hazardous Road Damage: Bitumen Pothole Cluster Washaway',
      description: 'Multiple deep craters and road damage spanning 200 meters. Multiple vehicle tire blowouts reported.',
      severity: 'critical',
      status: 'escalated',
      slaHours: 12,
      slaBreached: true,
      slaOverdueHours: 3.5,
      reportedByCount: 110,
      linkedSourceIds: ['SRC-02', 'SRC-03'],
      coordinates: selectedCity.coordinates,
      verificationConfidence: 96
    };
    const t2: CivicGrievanceLog = {
      id: `grv-${selectedCity.id}-rds-${Date.now()}-2`,
      ticketNumber: `#PWD-RDS-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST',
      relativeTime: 'Just now',
      city: selectedCity.name,
      ward: `${selectedCity.name} Ward 29 Sector 4`,
      category: 'Roads & Infrastructure',
      department: 'PWD Road Infrastructure',
      issue: 'Severe Road Damage: Utility Trench Subsidence Depression',
      description: 'Collapsed underground trench creates a 7-meter trench depression on commuter flyover ramp.',
      severity: 'high',
      status: 'active',
      slaHours: 24,
      slaBreached: false,
      reportedByCount: 78,
      linkedSourceIds: ['SRC-02'],
      coordinates: selectedCity.coordinates,
      verificationConfidence: 94
    };
    const updated = [t1, t2, ...grievances];
    setGrievances(updated);
    executeAgentScan(updated, selectedCity.name);
    showToast(`Injected 2 new 'road damage' grievances. Agent scanning in progress...`);
  };

  const handleDismissSpikeAlert = (spikeId: string) => {
    setSpikeAlerts((prev) =>
      prev.map((s) => (s.id === spikeId ? { ...s, status: 'dismissed' } : s))
    );
    if (activeSpikeFilter) {
      setActiveSpikeFilter(null);
    }
    showToast('Research notification dismissed.');
  };

  const handleFilterBySpike = (spike: SpikeDetectionAlert) => {
    setActiveSpikeFilter(spike.keyword);
    setActiveTab('stream');
    setSearchQuery(spike.keyword);
    showToast(`Filtering civic logs to clustered tickets for '${spike.keyword}'.`);
  };

  const handleClearSpikeFilter = () => {
    setActiveSpikeFilter(null);
    setSearchQuery('');
  };

  const handleLaunchSpikeResearch = (spike: SpikeDetectionAlert) => {
    if (onLaunchInvestigation) {
      onLaunchInvestigation(spike.suggestedResearchQuestion, spike.city);
    } else {
      onNavigate('research-workspace');
    }
  };

  const handleAddKeyword = () => {
    const kw = newKeywordInput.trim().toLowerCase();
    if (!kw || agentConfig.monitoredKeywords.includes(kw)) return;
    setAgentConfig((prev) => ({
      ...prev,
      monitoredKeywords: [...prev.monitoredKeywords, kw]
    }));
    setNewKeywordInput('');
    showToast(`Added '${kw}' to agent monitoring matrix.`);
  };

  const handleRemoveKeyword = (kw: string) => {
    setAgentConfig((prev) => ({
      ...prev,
      monitoredKeywords: prev.monitoredKeywords.filter((k) => k !== kw)
    }));
    showToast(`Removed '${kw}' from agent monitoring.`);
  };

  // Filtered and searched grievances list
  const filteredGrievances = useMemo(() => {
    return cityGrievances.filter((g) => {
      // Spike Filter
      if (activeSpikeFilter) {
        const k = activeSpikeFilter.toLowerCase();
        const matchesSpike =
          g.issue.toLowerCase().includes(k) ||
          g.description.toLowerCase().includes(k) ||
          g.category.toLowerCase().includes(k);
        if (!matchesSpike) return false;
      }

      // Severity / SLA Filter
      if (severityFilter === 'critical' && g.severity !== 'critical') return false;
      if (severityFilter === 'high' && g.severity !== 'high' && g.severity !== 'critical') return false;
      if (severityFilter === 'medium' && g.severity !== 'medium') return false;
      if (severityFilter === 'sla_breached' && !g.slaBreached) return false;

      // Category Filter
      if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          g.ticketNumber.toLowerCase().includes(q) ||
          g.issue.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.ward.toLowerCase().includes(q) ||
          g.department.toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      return true;
    });
  }, [cityGrievances, activeSpikeFilter, severityFilter, categoryFilter, searchQuery]);

  // Aggregate stats
  const activeCount = cityGrievances.filter((g) => g.status !== 'resolved').length;
  const criticalCount = cityGrievances.filter((g) => g.severity === 'critical').length;
  const breachedCount = cityGrievances.filter((g) => g.slaBreached).length;
  const totalCitizensImpacted = cityGrievances.reduce((acc, g) => acc + (g.reportedByCount || 1), 0);

  // Handle Quick Action Dispatch
  const handleAcknowledgeTicket = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id === ticketId) {
          const newStatus: GrievanceStatus = g.status === 'dispatched' ? 'resolved' : 'dispatched';
          return {
            ...g,
            status: newStatus,
            actionTaken:
              newStatus === 'resolved'
                ? 'Field unit completed rectification; verified by citizen geotag closure.'
                : 'Rapid Mobile Flying Squad dispatched with GPS telemetry tracking.'
          };
        }
        return g;
      })
    );
    showToast(`Updated status for ticket.`);
  };

  // Handle Submit New Telemetry Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.issue.trim()) return;

    const newTicket: CivicGrievanceLog = {
      id: `grv-${selectedCity.id}-${Date.now()}`,
      ticketNumber: `#MCD-311-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST',
      relativeTime: 'Just now',
      city: selectedCity.name,
      ward: newTicketForm.ward,
      category: newTicketForm.category as any,
      department: newTicketForm.department,
      issue: newTicketForm.issue,
      description: newTicketForm.description || newTicketForm.issue,
      severity: newTicketForm.severity,
      status: 'active',
      slaHours: newTicketForm.slaHours,
      slaBreached: false,
      reportedByCount: newTicketForm.reportedByCount,
      linkedSourceIds: [newTicketForm.linkedSourceId],
      linkedCitations: ['MCD-311-LIVE', 'GEO-INGEST'],
      coordinates: selectedCity.coordinates,
      actionTaken: 'Ticket ingested into municipal dispatch queue via Alert Center console.',
      verificationConfidence: 95,
      dispatchUnit: 'Pending Assignment'
    };

    setGrievances([newTicket, ...grievances]);
    setIsNewTicketModalOpen(false);
    setNewTicketForm({
      ward: `${selectedCity.name} Central Zone`,
      category: 'Air Quality & Emissions',
      department: `${selectedCity.name} Municipal Services`,
      issue: '',
      description: '',
      severity: 'high',
      slaHours: 24,
      reportedByCount: 12,
      linkedSourceId: 'SRC-02'
    });
    showToast(`New civic grievance ticket ${newTicket.ticketNumber} ingested successfully.`);
  };

  // Toast feedback helper
  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast(null);
    }, 3500);
  };

  // Trigger rapid investigation
  const handleInvestigateEmergency = (emg: EmergencyUpdate) => {
    if (onLaunchInvestigation) {
      onLaunchInvestigation(`Emergency Audit: ${emg.title}`, emg.city);
    } else {
      onNavigate('research-workspace');
    }
  };

  const handleWebSearchEmergency = (emg: EmergencyUpdate) => {
    if (onLaunchWebSearch) {
      onLaunchWebSearch(emg.title, emg.city);
    } else {
      onNavigate('web-intelligence');
    }
  };

  // Custom Recharts Tooltip for Incident Velocity Chart
  const CustomVelocityTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0F172A] text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 font-bold font-mono">
            <span>Interval {label}</span>
            <span className="text-[10px] text-blue-400 uppercase font-sans">Municipal Telemetry</span>
          </div>
          <div className="space-y-1 pt-1 font-mono text-[11px]">
            <div className="flex justify-between items-center text-blue-300">
              <span className="font-sans">New Grievances:</span>
              <strong className="text-white text-xs">{data.grievances}</strong>
            </div>
            <div className="flex justify-between items-center text-emerald-300">
              <span className="font-sans">Resolved / Closed:</span>
              <strong className="text-white text-xs">{data.resolved}</strong>
            </div>
            <div className="flex justify-between items-center text-critical-red">
              <span className="font-sans">SLA Breaches:</span>
              <strong className="text-white text-xs">{data.slaBreaches}</strong>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-700/60 text-[9.5px] text-slate-400 font-sans flex items-center justify-between">
            <span>Source Grounding:</span>
            <span className="text-blue-300 font-bold">[SRC-02 MCD 311 API]</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-space-md lg:p-space-lg max-w-[1720px] mx-auto w-full space-y-space-md">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-medium z-50 flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{notificationToast}</span>
        </div>
      )}

      {/* TOP HEADER & LIVE STREAM TICKER */}
      <div className="bg-surface-card rounded-xl p-space-md lg:p-space-lg shadow-sm border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-citation-ref text-citation-ref uppercase tracking-wider text-critical-red font-bold px-2 py-0.5 rounded bg-critical-red/10 border border-critical-red/20 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-critical-red animate-ping"></span>
              <span>CIVIC ALERT CENTER // REAL-TIME MONITORING</span>
            </span>
            <span className="text-text-muted font-micro-meta text-micro-meta">â€¢</span>
            <span className="font-micro-meta text-micro-meta text-text-muted uppercase tracking-wider">
              MUNICIPAL 311 &amp; DISASTER DISPATCH FEED
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-dark-surface tracking-tight font-bold">
              Urban Alert &amp; Grievance Center
            </h1>
            {/* City Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-surface-canvas border border-border-subtle rounded-lg px-2.5 py-1">
              <span className="material-symbols-outlined text-[16px] text-primary">location_city</span>
              <span className="text-xs text-text-muted font-medium">Selected City:</span>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="bg-transparent font-bold text-xs text-dark-surface outline-none cursor-pointer pr-1"
              >
                {MONITORED_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.state})
                  </option>
                ))}
              </select>
            </div>
            <span className="font-citation-ref text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
              Platform data
            </span>
          </div>

          <p className="font-body-default text-text-muted max-w-4xl text-xs sm:text-sm">
            Continuous ingestion of geo-referenced 311 municipal complaints, SCADA pressure anomalies, air pollution alerts, and emergency directives across {selectedCity.name}. Cross-referenced with statutory audit datasets and verified urban intelligence sources.
          </p>
        </div>

        {/* Live Stream Status & Action Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {/* Live Telemetry Ticker */}
          <div className="flex items-center gap-2 bg-surface-canvas px-3 py-2 rounded-lg border border-border-subtle">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLiveStreamActive ? 'bg-emerald-500' : 'bg-slate-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLiveStreamActive ? 'bg-emerald-600' : 'bg-slate-500'}`}></span>
            </span>
            <div className="text-xs font-mono">
              <div className="font-bold text-dark-surface flex items-center gap-1.5">
                <span>{isLiveStreamActive ? 'LIVE STREAM' : 'STREAM PAUSED'}</span>
                {isLiveStreamActive && (
                  <span className="text-[10px] text-text-muted font-normal">({secondsUntilNextPoll}s)</span>
                )}
              </div>
              <div className="text-[10px] text-text-muted font-sans">
                {selectedCity.leadAuthority}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
              className="ml-2 text-text-muted hover:text-dark-surface p-1 rounded hover:bg-surface-card transition-colors cursor-pointer"
              title={isLiveStreamActive ? 'Pause Telemetry' : 'Resume Telemetry'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isLiveStreamActive ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNewTicketModalOpen(true)}
              className="px-3.5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_alert</span>
              <span>Ingest Grievance</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('web-intelligence')}
              className="px-3 py-2 bg-surface-canvas border border-border-subtle rounded-lg text-xs font-semibold text-text-body hover:text-dark-surface hover:bg-surface-card transition-colors flex items-center gap-1 cursor-pointer"
              title="Search related web intelligence"
            >
              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
              <span className="hidden lg:inline">Web Intel</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOP ANALYTICAL KPIS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* KPI 1: Active Incidents */}
        <div className="p-3.5 bg-surface-card rounded-xl border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-muted text-[11px] font-citation-ref uppercase font-bold">
            <span>Active Incidents</span>
            <span className="material-symbols-outlined text-[16px] text-primary">warning</span>
          </div>
          <div className="font-mono text-2xl font-bold text-dark-surface">
            {activeCount}
          </div>
          <div className="text-[10px] text-text-muted">
            Across {selectedCity.monitoredWards} monitored municipal wards
          </div>
        </div>

        {/* KPI 2: Critical Severity */}
        <div className="p-3.5 bg-surface-card rounded-xl border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center justify-between text-critical-red text-[11px] font-citation-ref uppercase font-bold">
            <span>Critical Severity</span>
            <span className="material-symbols-outlined text-[16px] text-critical-red">error</span>
          </div>
          <div className="font-mono text-2xl font-bold text-critical-red">
            {criticalCount}
          </div>
          <div className="text-[10px] text-critical-red font-medium">
            Immediate dispatch SLA &lt; 12 hrs
          </div>
        </div>

        {/* KPI 3: SLA Overdue / Breached */}
        <div className="p-3.5 bg-surface-card rounded-xl border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center justify-between text-orange-600 text-[11px] font-citation-ref uppercase font-bold">
            <span>SLA Breaches</span>
            <span className="material-symbols-outlined text-[16px] text-orange-600">timer_off</span>
          </div>
          <div className="font-mono text-2xl font-bold text-orange-600">
            {breachedCount}
          </div>
          <div className="text-[10px] text-text-muted font-label-code">
            Compliance rate: {selectedCity.complianceRate}%
          </div>
        </div>

        {/* KPI 4: Citizen Co-Reporters */}
        <div className="p-3.5 bg-surface-card rounded-xl border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-muted text-[11px] font-citation-ref uppercase font-bold">
            <span>Affected Citizens</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">groups</span>
          </div>
          <div className="font-mono text-2xl font-bold text-dark-surface">
            {totalCitizensImpacted}
          </div>
          <div className="text-[10px] text-text-muted">
            Aggregated from 311 app telemetry
          </div>
        </div>

        {/* KPI 5: Verified Source Attribution */}
        <div className="p-3.5 bg-surface-card rounded-xl border border-border-subtle shadow-xs space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-emerald-700 text-[11px] font-citation-ref uppercase font-bold">
            <span>Statutory Linkage</span>
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-700">
            100%
          </div>
          <div className="text-[10px] text-text-muted truncate">
            Grounding in SRC-01 to SRC-05
          </div>
        </div>
      </div>

      {/* SECTION: AUTOMATED AGENT SENTINEL CONTROL BAR */}
      <div className="bg-surface-card rounded-xl p-3.5 border border-primary/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isScanning ? 'bg-primary' : 'bg-emerald-500'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isScanning ? 'bg-primary' : 'bg-emerald-600'}`}></span>
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-headline-sm text-xs font-bold text-dark-surface uppercase tracking-wider">
                <span className="material-symbols-outlined text-[15px] text-primary">psychology</span>
                <span>Automated Grievance Spike Detection Agent</span>
                <span className="font-citation-ref text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  {agentConfig.enabled ? 'ACTIVE SENTINEL' : 'STANDBY'}
                </span>
              </div>
              <div className="text-[11px] text-text-muted flex items-center gap-2 flex-wrap">
                <span>Scanning {cityGrievances.length} tickets for common spikes:</span>
                {agentConfig.monitoredKeywords.slice(0, 4).map((kw) => {
                  const stat = keywordFrequencyStats.find((s) => s.keyword === kw);
                  return (
                    <span
                      key={kw}
                      className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${
                        stat?.isSpiking
                          ? 'bg-critical-red/10 text-critical-red border-critical-red/30 font-bold'
                          : 'bg-surface-canvas text-text-muted border-border-subtle'
                      }`}
                    >
                      '{kw}' ({stat?.count || 0})
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sentinel Controls & Diagnostics Action */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => executeAgentScan(grievances, selectedCity.name)}
            disabled={isScanning}
            className="px-2.5 py-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-xs font-semibold text-text-body hover:text-primary hover:bg-surface-card transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Trigger proactive grievance scan immediately"
          >
            <span className={`material-symbols-outlined text-[15px] ${isScanning ? 'animate-spin text-primary' : ''}`}>
              sync
            </span>
            <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
          </button>

          {/* Dev-only Diagnostic Tab Shortcut */}
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => setActiveTab('agent-sentinel')}
              className="px-2.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
              title="Open Testing / Diagnostics Console"
            >
              <span className="material-symbols-outlined text-[14px]">science</span>
              <span>Testing / Diagnostics</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAgentConsoleOpen(true)}
            className="p-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-text-muted hover:text-dark-surface transition-colors cursor-pointer"
            title="Open Agent Configuration"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
          </button>
        </div>
        </div>
  
        {/* SECTION: PROACTIVE AGENT RESEARCH NOTIFICATIONS (WHEN SPIKES DETECTED) */}
        {citySpikeAlerts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-critical-red animate-bounce">
                  notifications_active
                </span>
                <h2 className="font-headline-sm text-sm font-bold text-dark-surface uppercase tracking-wider flex items-center gap-2">
                  <span>Proactive Agent Research Notifications</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-critical-red text-white">
                    {citySpikeAlerts.length} DETECTED
                  </span>
                </h2>
              </div>
              <span className="text-[11px] font-citation-ref text-text-muted">
                Auto-Correlated with MCD 311 &amp; CAG Audits [SRC-02, SRC-04]
              </span>
            </div>
  
            <div className="space-y-3">
              {citySpikeAlerts.map((spike) => (
                <div
                  key={spike.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-space-md border-2 border-critical-red/50 shadow-md transition-all space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-critical-red via-orange-500 to-amber-500"></div>
  
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 pt-1">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-citation-ref text-[10.5px] uppercase font-bold px-2 py-0.5 rounded bg-critical-red text-white shadow-2xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">emergency</span>
                          <span>AGENT SPIKE ALERT</span>
                        </span>
                        <DataOriginBadge origin="DERIVED" compact />
                        <span className="font-mono text-xs font-bold text-primary">
                          {spike.code}
                        </span>
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          Keyword: '{spike.keyword}'
                        </span>
                        <span className="text-[11px] font-citation-ref text-text-muted">
                          • Detected {spike.relativeTime}
                        </span>
                      </div>
  
                      <h3 className="font-headline-sm text-base font-bold text-dark-surface">
                        {spike.patternLabel}
                      </h3>
  
                      {/* Grounded Hypothesis & Research Recommendation */}
                      <div className="space-y-1 bg-surface-canvas p-3 rounded-lg border border-border-subtle text-xs">
                        <div className="font-citation-ref text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-primary">lightbulb</span>
                          <span>Suggested Autonomous Research Hypothesis</span>
                        </div>
                        <div className="font-semibold text-dark-surface">
                          "{spike.suggestedResearchQuestion}"
                        </div>
                        <p className="text-text-body font-normal leading-relaxed text-[11.5px] pt-1">
                          {spike.hypothesis}
                        </p>
                      </div>
  
                      {/* Affected Wards & Impact Callouts */}
                      <div className="flex items-center gap-2 text-xs flex-wrap pt-0.5">
                        <span className="font-citation-ref text-[10px] text-text-muted uppercase">Hotspot Wards:</span>
                        {spike.affectedWards.map((w, wIdx) => (
                          <span
                            key={wIdx}
                            className="font-medium text-[11px] px-2 py-0.5 rounded bg-surface-container text-dark-surface border border-border-subtle"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
  
                    {/* Impact Stats Box */}
                    <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-start gap-2 shrink-0 bg-surface-canvas p-3 rounded-xl border border-border-subtle text-right">
                      <div>
                        <div className="text-[10px] font-citation-ref text-text-muted uppercase font-bold">
                          Spike Magnitude
                        </div>
                        <div className="font-mono text-xl font-bold text-critical-red">
                          {spike.velocityMultiplier}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {spike.matchedTicketCount} clustered complaints
                        </div>
                      </div>
                      <div className="pt-1 border-t border-border-subtle/60 w-full lg:w-auto text-right">
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                          {spike.confidenceScore}% Confidence Score
                        </span>
                      </div>
                    </div>
                  </div>
  
                  {/* Footer Controls & Citations */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-citation-ref text-[10px] text-text-muted uppercase">Correlated Evidence:</span>
                      {spike.linkedSourceIds.map((srcId) => {
                        const s = sourceLookup.get(srcId);
                        return (
                          <CitationQuickGlance
                            key={srcId}
                            identifier={srcId}
                            label={`[${srcId}] ${s?.title ? s.title.split(' ')[0] : ''}`}
                            source={s}
                            onInspectFullCitation={onInspectCitation}
                          />
                        );
                      })}
                    </div>
  
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleFilterBySpike(spike)}
                        className="px-2.5 py-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-xs font-semibold text-text-body hover:text-primary hover:bg-surface-card transition-colors flex items-center gap-1 cursor-pointer"
                        title="Filter 311 logs below to only this spike's tickets"
                      >
                        <span className="material-symbols-outlined text-[14px]">filter_list</span>
                        <span>View Clustered Tickets ({spike.matchedTicketCount})</span>
                      </button>
  
                      <button
                        type="button"
                        onClick={() => {
                          if (onLaunchWebSearch) {
                            onLaunchWebSearch(spike.suggestedResearchQuestion, spike.city);
                          } else {
                            onNavigate('web-intelligence');
                          }
                        }}
                        className="px-2.5 py-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-xs font-semibold text-text-body hover:text-primary hover:bg-surface-card transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">travel_explore</span>
                        <span>Web Intel</span>
                      </button>
  
                      <button
                        type="button"
                        onClick={() => handleLaunchSpikeResearch(spike)}
                        className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">science</span>
                        <span>Launch Autonomous Investigation</span>
                      </button>
  
                      <button
                        type="button"
                        onClick={() => handleDismissSpikeAlert(spike.id)}
                        className="p-1 rounded text-text-muted hover:text-dark-surface hover:bg-surface-canvas transition-colors"
                        title="Dismiss this research notification"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {/* SECTION: EMERGENCY UPDATES BANNER (IF ACTIVE FOR THIS CITY) */}
        {cityEmergencies.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-critical-red">campaign</span>
                <h2 className="font-headline-sm text-sm font-bold text-dark-surface uppercase tracking-wider">
                  Active Emergency Directives &amp; Advisory Broadcasts ({cityEmergencies.length})
                </h2>
              </div>
              <span className="text-[11px] font-citation-ref text-text-muted">
                Source Authority: {selectedCity.portalName}
              </span>
            </div>
  
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
              {cityEmergencies.map((emg) => {
                const isRed = emg.alertLevel === 'RED_ALERT';
                return (
                  <div
                    key={emg.id}
                    className={`rounded-xl p-space-md border shadow-xs transition-all space-y-3 ${
                      isRed
                        ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                        : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                    }`}
                  >
                    {/* Emergency Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-border-subtle/50 pb-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-citation-ref text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                              isRed
                                ? 'bg-critical-red text-white border-red-700'
                                : 'bg-amber-600 text-white border-amber-700'
                            }`}
                          >
                            {emg.alertLevel.replace('_', ' ')}
                          </span>
                          <span className="font-mono text-xs font-bold text-dark-surface">
                            {emg.code}
                          </span>
                          <span className="text-text-muted text-[11px] font-citation-ref">
                            â€¢ {emg.effectiveFrom}
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-base font-bold text-dark-surface leading-tight">
                          {emg.title}
                        </h3>
                      </div>
  
                      {/* Impact Metric Callout */}
                      <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-border-subtle text-right shrink-0">
                        <div className="text-[10px] font-citation-ref text-text-muted uppercase">
                          {emg.impactMetric.label}
                        </div>
                        <div className="font-mono text-lg font-bold text-critical-red">
                          {emg.impactMetric.value}
                        </div>
                        {emg.impactMetric.subtext && (
                          <div className="text-[9px] text-text-muted font-sans">
                            {emg.impactMetric.subtext}
                          </div>
                        )}
                      </div>
                    </div>
  
                    {/* Summary Narrative */}
                    <p className="font-body-compact text-xs text-text-body leading-relaxed">
                      {emg.summary}
                    </p>
  
                    {/* Mandatory Directives Checklist */}
                    <div className="space-y-1.5 bg-white/70 dark:bg-slate-900/60 p-3 rounded-lg border border-border-subtle/60">
                      <div className="text-[11px] font-citation-ref font-bold text-dark-surface uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">rule</span>
                        <span>Mandatory Enforcement Directives</span>
                      </div>
                      <ul className="space-y-1 text-xs text-text-body">
                        {emg.mandatoryDirectives.map((directive, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2">
                            <span className="text-primary font-bold text-xs mt-0.5">â€¢</span>
                            <span className="leading-snug">{directive}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
  
                    {/* Footer with Linked Citations & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-text-muted text-[10px] font-citation-ref">EVIDENCE SOURCES:</span>
                        {emg.linkedSourceIds.map((srcId) => {
                          const s = sourceLookup.get(srcId);
                          return (
                            <CitationQuickGlance
                              key={srcId}
                              identifier={srcId}
                              label={`[${srcId}] ${s?.documentType ? s.documentType.split(' ')[0] : ''}`}
                              source={s}
                              onInspectFullCitation={onInspectCitation}
                            />
                          );
                        })}
                      </div>
  
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleInvestigateEmergency(emg)}
                          className="px-2.5 py-1 bg-surface-canvas border border-border-subtle rounded text-xs font-semibold text-text-body hover:text-primary hover:bg-surface-card transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">science</span>
                          <span>Workspace Audit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWebSearchEmergency(emg)}
                          className="px-2.5 py-1 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">search</span>
                          <span>Investigate Web</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
  
        {/* DUAL-TABBED WORKSPACE: STREAM vs ANALYTICAL VELOCITY CHARTS */}
        <div className="bg-surface-card rounded-xl p-space-md lg:p-space-lg shadow-sm border border-border-subtle space-y-space-md">
          {/* Navigation Tabs Bar inside Alert Center */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
            <div className="flex items-center gap-1.5 bg-surface-canvas p-1 rounded-lg border border-border-subtle shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('stream')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'stream'
                    ? 'bg-surface-card text-primary shadow-xs font-bold'
                    : 'text-text-muted hover:text-dark-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">list_alt</span>
                <span>Civic Grievance Logs ({cityGrievances.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-surface-card text-primary shadow-xs font-bold'
                    : 'text-text-muted hover:text-dark-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">ssid_chart</span>
                <span>Recharts Telemetry &amp; Velocity</span>
              </button>
              {import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={() => setActiveTab('agent-sentinel')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'agent-sentinel'
                      ? 'bg-surface-card text-primary shadow-xs font-bold'
                      : 'text-text-muted hover:text-dark-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px] text-amber-500">science</span>
                  <span>Testing &amp; Diagnostics</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                    DEV
                  </span>
                  {citySpikeAlerts.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-critical-red text-white">
                      {citySpikeAlerts.length}
                    </span>
                  )}
                </button>
              )}
            </div>
  
            {/* Quick Filter Controls for Stream */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search Input */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ticket, ward, issue..."
                  className="pl-8 pr-3 py-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-xs text-dark-surface outline-none focus:border-primary w-48 sm:w-60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-dark-surface"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>
  
              {/* Severity Pill Filter */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="bg-surface-canvas border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-dark-surface outline-none cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical Severity Only</option>
                <option value="high">High &amp; Critical</option>
                <option value="medium">Medium</option>
                <option value="sla_breached">SLA Overdue Only</option>
              </select>
  
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-surface-canvas border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-dark-surface outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Air Quality & Emissions">Air Quality &amp; Emissions</option>
                <option value="Transit & Mobility">Transit &amp; Mobility</option>
                <option value="Water Supply & SCADA">Water Supply &amp; SCADA</option>
                <option value="Sanitation & Solid Waste">Sanitation &amp; Solid Waste</option>
                <option value="Roads & Infrastructure">Roads &amp; Infrastructure</option>
                <option value="Public Health & Clinics">Public Health &amp; Clinics</option>
              </select>
            </div>
          </div>
  
          {/* TAB 1: CIVIC GRIEVANCE STREAM */}
          {activeTab === 'stream' && (
            <div className="space-y-3">
              {/* Active Spike Filter Ribbon */}
              {activeSpikeFilter && (
                <div className="p-2.5 bg-brand-tint border border-primary/30 rounded-lg flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">filter_alt</span>
                    <span className="font-semibold text-dark-surface">
                      Filtered by Proactive Agent Spike Pattern: <strong className="text-primary font-mono">'{activeSpikeFilter}'</strong>
                    </span>
                    <span className="text-[11px] text-text-muted">
                      ({filteredGrievances.length} clustered tickets matched)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSpikeFilter}
                    className="px-2 py-0.5 bg-surface-card border border-border-subtle rounded text-xs font-semibold hover:bg-surface-canvas text-primary cursor-pointer"
                  >
                    Show All Tickets
                  </button>
                </div>
              )}
              {filteredGrievances.length === 0 ? (
                <div className="p-8 text-center bg-surface-canvas rounded-xl border border-border-subtle space-y-2">
                  <span className="material-symbols-outlined text-[32px] text-text-muted">rule_folder</span>
                  <div className="font-bold text-sm text-dark-surface">No Grievance Logs Match Current Filter</div>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    Try adjusting the severity or category dropdowns, or clear the search query.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSeverityFilter('all');
                      setCategoryFilter('all');
                    }}
                    className="mt-2 px-3 py-1 bg-surface-card border border-border-subtle rounded text-xs font-semibold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {filteredGrievances.map((g) => {
                    const isCrit = g.severity === 'critical';
                    const isHigh = g.severity === 'high';
                    return (
                      <div
                        key={g.id}
                        onClick={() => setInspectingTicket(g)}
                        className="p-3.5 hover:bg-surface-canvas/80 transition-colors cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-3 group"
                      >
                        {/* Left: Ticket Core Info */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-citation-ref text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                isCrit
                                  ? 'bg-critical-red/10 text-critical-red border-critical-red/20'
                                  : isHigh
                                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {g.severity.toUpperCase()}
                            </span>
  
                            <span className="font-mono text-xs font-bold text-primary">
                              {g.ticketNumber}
                            </span>
                            <DataOriginBadge origin="LIVE" compact />
  
                            <span className="text-text-muted text-[11px] font-citation-ref">
                              • {g.relativeTime} ({g.timestamp})
                            </span>
  
                            {/* Category Badge */}
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-surface-container text-text-body">
                              {g.category}
                            </span>
  
                            {/* SLA Badge */}
                            {g.slaBreached ? (
                              <span className="font-citation-ref text-[10px] text-critical-red font-bold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[13px]">warning</span>
                                <span>SLA Breached (+{g.slaOverdueHours}h overdue)</span>
                              </span>
                            ) : (
                              <span className="font-citation-ref text-[10px] text-emerald-700 font-medium">
                                SLA: {g.slaHours}h Target
                              </span>
                            )}
                          </div>
  
                          {/* Title / Issue */}
                          <div className="font-headline-sm text-sm font-bold text-dark-surface group-hover:text-primary transition-colors flex items-center gap-1.5">
                            <span>{g.issue}</span>
                            <span className="material-symbols-outlined text-[14px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                              open_in_new
                            </span>
                          </div>
  
                          {/* Description */}
                          <p className="font-body-compact text-xs text-text-body line-clamp-2 leading-relaxed">
                            {g.description}
                          </p>
  
                          {/* Ward, Dept, Co-reporters */}
                          <div className="flex items-center gap-3 text-[11px] text-text-muted flex-wrap pt-0.5">
                            <span className="flex items-center gap-1 font-medium text-dark-surface">
                              <span className="material-symbols-outlined text-[13px] text-primary">pin_drop</span>
                              <span>{g.ward}</span>
                            </span>
                            <span>â€¢</span>
                            <span>Dept: <strong className="text-text-body font-normal">{g.department}</strong></span>
                            <span>â€¢</span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-secondary">groups</span>
                              <span><strong>{g.reportedByCount}</strong> co-reporters</span>
                            </span>
                            <span>â€¢</span>
                            <span className="text-emerald-700 font-mono text-[10px]">
                              {g.verificationConfidence}% Confidence
                            </span>
                          </div>
                        </div>
  
                        {/* Right: Source Badges & Quick Action Controls */}
                        <div className="flex flex-row md:flex-col items-end justify-between md:justify-start gap-2 shrink-0">
                          {/* Linked Evidence Source Buttons */}
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[9.5px] font-citation-ref text-text-muted uppercase">CITATIONS:</span>
                            {g.linkedSourceIds.map((srcId) => (
                              <CitationQuickGlance
                                key={srcId}
                                identifier={srcId}
                                label={`[${srcId}]`}
                                source={sourceLookup.get(srcId)}
                                onInspectFullCitation={onInspectCitation}
                              />
                            ))}
                          </div>
  
                          {/* Quick Dispatch / Action Status Button */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                g.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : g.status === 'dispatched'
                                  ? 'bg-blue-100 text-blue-800'
                                  : g.status === 'escalated'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {g.status.toUpperCase()}
                            </span>
  
                            <button
                              type="button"
                              onClick={(e) => handleAcknowledgeTicket(g.id, e)}
                              className="px-2.5 py-1 bg-surface-card border border-border-subtle rounded text-xs font-semibold hover:bg-primary hover:text-white hover:border-primary transition-colors cursor-pointer shadow-2xs"
                              title="Toggle field dispatch / resolution status"
                            >
                              {g.status === 'resolved' ? 'Re-open' : 'Update Status'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
  
          {/* TAB 2: RECHARTS TELEMETRY & VELOCITY CHARTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
                {/* Hourly Incident Velocity Chart (8 cols) */}
                <div className="lg:col-span-8 bg-surface-canvas rounded-xl p-4 border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-headline-sm text-sm font-bold text-dark-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-primary">monitoring</span>
                        <span>Diurnal Incident Inflow Velocity vs Resolution SLA (Recharts)</span>
                      </div>
                      <p className="text-[11px] text-text-muted">
                        Hourly volume of incoming 311 citizen grievances plotted against municipal resolution closures.
                      </p>
                    </div>
                    <span className="font-citation-ref text-[11px] text-primary font-bold">
                      [SRC-02 MCD 311 API STREAM]
                    </span>
                  </div>
  
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={HOURLY_INCIDENT_SURGE_DATA}
                        margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="grievanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0053db" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0053db" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="hour"
                          tick={{ fill: '#64748b', fontSize: 11 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomVelocityTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="grievances"
                          name="Incoming Complaints"
                          stroke="#0053db"
                          strokeWidth={2.5}
                          fill="url(#grievanceGradient)"
                        />
                        <Area
                          type="monotone"
                          dataKey="resolved"
                          name="Closed / Rectified"
                          stroke="#059669"
                          strokeWidth={2}
                          fill="url(#resolvedGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
  
                  <div className="flex items-center justify-between text-xs text-text-muted pt-1 border-t border-border-subtle flex-wrap gap-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-medium text-dark-surface">
                        <span className="inline-block w-3 h-3 rounded-xs bg-[#0053db]"></span>
                        <span>Incoming Complaints (311)</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-emerald-800">
                        <span className="inline-block w-3 h-3 rounded-xs bg-[#059669]"></span>
                        <span>Resolved Field Actions</span>
                      </span>
                    </div>
                    <span className="font-citation-ref text-[11px]">
                      Peak Headway Surge: <strong>18:00 IST (+62/hr)</strong>
                    </span>
                  </div>
                </div>
  
                {/* Category Breakdown Bar Chart (4 cols) */}
                <div className="lg:col-span-4 bg-surface-canvas rounded-xl p-4 border border-border-subtle space-y-3">
                  <div className="space-y-0.5">
                    <div className="font-headline-sm text-sm font-bold text-dark-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary">pie_chart</span>
                      <span>Category Breakdown</span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Proportional density of active civic complaints by municipal sector.
                    </p>
                  </div>
  
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={CATEGORY_BREAKDOWN_DATA}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fill: '#334155', fontSize: 10 }}
                          width={110}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(val: any, name: any, item: any) => [
                            `${val} complaints (${item.payload.percentage}%)`,
                            'Incident Volume'
                          ]}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {CATEGORY_BREAKDOWN_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
  
                  <div className="text-[10px] text-text-muted pt-1 border-t border-border-subtle flex justify-between">
                    <span>Leading Sector: <strong>Transit &amp; Mobility</strong></span>
                    <span className="font-bold text-primary">28% share</span>
                  </div>
                </div>
              </div>
            </div>
          )}
  
          {/* TAB 3: AGENT SENTINEL DIAGNOSTICS & CONTROLS */}
          {activeTab === 'agent-sentinel' && (
            <div className="space-y-6">
              {/* Top Diagnostics KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-surface-canvas rounded-xl border border-border-subtle space-y-1">
                  <div className="text-[10.5px] font-citation-ref text-text-muted uppercase font-bold flex items-center justify-between">
                    <span>Agent Sentinel Status</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="font-mono text-xl font-bold text-dark-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                    <span>{agentConfig.enabled ? 'AUTONOMOUS ACTIVE' : 'PAUSED'}</span>
                  </div>
                  <div className="text-[10px] text-text-muted">
                    Polling cycle: every {agentConfig.scanIntervalSeconds}s
                  </div>
                </div>
  
                <div className="p-3.5 bg-surface-canvas rounded-xl border border-border-subtle space-y-1">
                  <div className="text-[10.5px] font-citation-ref text-text-muted uppercase font-bold">
                    Monitored Patterns
                  </div>
                  <div className="font-mono text-2xl font-bold text-primary">
                    {agentConfig.monitoredKeywords.length}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    Trigger threshold: â‰¥ {agentConfig.spikeThreshold} complaints
                  </div>
                </div>
  
                <div className="p-3.5 bg-surface-canvas rounded-xl border border-border-subtle space-y-1">
                  <div className="text-[10.5px] font-citation-ref text-critical-red uppercase font-bold">
                    Active City Spikes
                  </div>
                  <div className="font-mono text-2xl font-bold text-critical-red">
                    {citySpikeAlerts.length}
                  </div>
                  <div className="text-[10px] text-critical-red font-medium">
                    {citySpikeAlerts.map((s) => `'${s.keyword}'`).join(', ') || 'No active spikes'}
                  </div>
                </div>
  
                <div className="p-3.5 bg-surface-canvas rounded-xl border border-border-subtle space-y-1">
                  <div className="text-[10.5px] font-citation-ref text-text-muted uppercase font-bold">
                    Total Scan Operations
                  </div>
                  <div className="font-mono text-2xl font-bold text-dark-surface">
                    {agentScanLogs.length}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    Correlated against {selectedCity.monitoredWards} wards
                  </div>
                </div>
              </div>
  
              {/* Two-Column Workspace: Controls & Keyword Matrix (5 cols) + Live Scan Activity Terminal (7 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
                {/* Left Column: Agent Sensitivity & Keyword Management (5 cols) */}
                <div className="lg:col-span-5 bg-surface-canvas rounded-xl p-4 border border-border-subtle space-y-4">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <div className="font-headline-sm text-sm font-bold text-dark-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">tune</span>
                      <span>Proactive Agent Configuration</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAgentConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
                        showToast(`Agent Sentinel auto-scan ${!agentConfig.enabled ? 'enabled' : 'paused'}.`);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        agentConfig.enabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {agentConfig.enabled ? 'ENGINE ON' : 'ENGINE OFF'}
                    </button>
                  </div>
  
                  {/* Sensitivity Controls */}
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-text-muted">
                        <span className="font-semibold text-dark-surface">Spike Threshold Trigger</span>
                        <span className="font-mono font-bold text-primary">â‰¥ {agentConfig.spikeThreshold} complaints</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {[2, 3, 4, 5].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setAgentConfig((prev) => ({ ...prev, spikeThreshold: t }));
                              showToast(`Updated spike threshold to â‰¥ ${t} complaints.`);
                            }}
                            className={`flex-1 py-1.5 rounded border text-xs font-mono font-bold cursor-pointer transition-colors ${
                              agentConfig.spikeThreshold === t
                                ? 'bg-primary text-white border-primary'
                                : 'bg-surface-card border-border-subtle text-text-body hover:bg-slate-100'
                            }`}
                          >
                            â‰¥ {t}
                          </button>
                        ))}
                      </div>
                    </div>
  
                    <div className="space-y-1">
                      <div className="flex justify-between text-text-muted">
                        <span className="font-semibold text-dark-surface">Proactive Scan Frequency</span>
                        <span className="font-mono font-bold text-primary">{agentConfig.scanIntervalSeconds} seconds</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {[5, 10, 15, 30].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => {
                              setAgentConfig((prev) => ({ ...prev, scanIntervalSeconds: sec }));
                              showToast(`Scan frequency set to every ${sec}s.`);
                            }}
                            className={`flex-1 py-1.5 rounded border text-xs font-mono font-bold cursor-pointer transition-colors ${
                              agentConfig.scanIntervalSeconds === sec
                                ? 'bg-primary text-white border-primary'
                                : 'bg-surface-card border-border-subtle text-text-body hover:bg-slate-100'
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
  
                  {/* Monitored Keywords Matrix */}
                  <div className="space-y-2 pt-2 border-t border-border-subtle">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-dark-surface">Monitored Complaint Vectors</span>
                      <span className="text-[10px] text-text-muted font-mono">{agentConfig.monitoredKeywords.length} active</span>
                    </div>
  
                    <div className="flex flex-wrap gap-1.5">
                      {agentConfig.monitoredKeywords.map((kw) => {
                        const stat = keywordFrequencyStats.find((s) => s.keyword === kw);
                        return (
                          <span
                            key={kw}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                              stat?.isSpiking
                                ? 'bg-critical-red/10 text-critical-red border-critical-red/30 font-bold'
                                : 'bg-surface-card text-dark-surface border-border-subtle'
                            }`}
                          >
                            <span>{kw}</span>
                            <span className="font-mono text-[10px] opacity-75">({stat?.count || 0})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyword(kw)}
                              className="text-text-muted hover:text-critical-red cursor-pointer ml-0.5"
                              title={`Remove '${kw}'`}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
  
                    {/* Add Keyword Input */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={newKeywordInput}
                        onChange={(e) => setNewKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                        placeholder="Add keyword (e.g. pothole, sewage)..."
                        className="flex-1 px-2.5 py-1.5 bg-surface-card border border-border-subtle rounded-lg text-xs text-dark-surface outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
  
                  {/* Instant Spike Simulation Testing Strip */}
                  <div className="p-3 bg-brand-tint/60 rounded-lg border border-primary/20 space-y-2">
                    <div className="text-[10.5px] font-citation-ref text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">science</span>
                      <span>Proactive Spike Testing Simulators</span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Inject mock civic grievances to watch the automated agent detect the cluster and generate research notifications in real time:
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleInjectWaterloggingSpike}
                        className="flex-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">water</span>
                        <span>Inject Waterlogging Spike</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleInjectRoadDamageSpike}
                        className="flex-1 px-2.5 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">construction</span>
                        <span>Inject Road Damage Spike</span>
                      </button>
                    </div>
                  </div>
                </div>
  
                {/* Right Column: Live Agent Scan Activity Terminal (7 cols) */}
                <div className="lg:col-span-7 bg-[#0B132B] text-slate-200 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs flex flex-col h-[520px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="font-bold text-white text-xs">
                        AGENT TELEMETRY SCAN STREAM // REAL-TIME LOG
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {agentScanLogs.length} events logged
                    </span>
                  </div>
  
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-text">
                    {agentScanLogs.map((log) => {
                      const isSpike = log.status === 'spike_detected';
                      const isCorr = log.status === 'correlating';
                      return (
                        <div
                          key={log.id}
                          className={`p-2.5 rounded-lg border text-[11px] leading-relaxed transition-all ${
                            isSpike
                              ? 'bg-red-950/40 border-red-800/80 text-red-200'
                              : isCorr
                              ? 'bg-blue-950/40 border-blue-800/80 text-blue-200'
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-1 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">[{log.timestamp}]</span>
                              <span
                                className={`px-1.5 py-0.2 rounded font-bold ${
                                  isSpike
                                    ? 'bg-red-500 text-white'
                                    : isCorr
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-700 text-slate-200'
                                }`}
                              >
                                {log.action}
                              </span>
                              {log.keyword && (
                                <span className="text-amber-300">keyword: '{log.keyword}'</span>
                              )}
                            </div>
                            {log.matchCount !== undefined && (
                              <span className="text-red-400 font-bold">
                                {log.matchCount} matched
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-sans text-slate-200">
                            {log.detail}
                          </p>
                        </div>
                      );
                    })}
                  </div>
  
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10.5px] text-slate-400 font-sans">
                    <span>Proactive Anomaly Engine v2.4</span>
                    <button
                      type="button"
                      onClick={() => executeAgentScan(grievances, selectedCity.name)}
                      className="text-blue-400 hover:text-blue-300 underline font-mono cursor-pointer"
                    >
                      Run Instant Pass â†’
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
  
        {/* AGENT CONSOLE MODAL (IF TOGGLED FROM BAR) */}
        {isAgentConsoleOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-card rounded-2xl max-w-3xl w-full border border-border-subtle shadow-2xl overflow-hidden p-space-lg space-y-4">
              <div className="flex items-start justify-between border-b border-border-subtle pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                    <h3 className="font-headline-sm text-base font-bold text-dark-surface">
                      Automated Agent Sentinel Console
                    </h3>
                  </div>
                  <p className="text-xs text-text-muted">
                    Proactive municipal complaint scanner configuration and live detection telemetry stream.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAgentConsoleOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-canvas text-text-muted hover:text-dark-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
  
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-surface-canvas rounded-lg border border-border-subtle space-y-1">
                  <div className="text-text-muted font-citation-ref text-[10px] uppercase font-bold">Engine Status</div>
                  <div className="font-mono text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{agentConfig.enabled ? 'ACTIVE RUNTIME' : 'SUSPENDED'}</span>
                  </div>
                  <div className="text-[10px] text-text-muted">Interval: {agentConfig.scanIntervalSeconds}s</div>
                </div>
  
                <div className="p-3 bg-surface-canvas rounded-lg border border-border-subtle space-y-1">
                  <div className="text-text-muted font-citation-ref text-[10px] uppercase font-bold">Spike Trigger Rule</div>
                  <div className="font-mono text-sm font-bold text-primary">â‰¥ {agentConfig.spikeThreshold} complaints</div>
                  <div className="text-[10px] text-text-muted">Within 24h complaint window</div>
                </div>
  
                <div className="p-3 bg-surface-canvas rounded-lg border border-border-subtle space-y-1">
                  <div className="text-text-muted font-citation-ref text-[10px] uppercase font-bold">Active City Spikes</div>
                  <div className="font-mono text-sm font-bold text-critical-red">{citySpikeAlerts.length} Detected</div>
                  <div className="text-[10px] text-text-muted">In {selectedCity.name}</div>
                </div>
              </div>
  
              {/* Keyword Frequency Ledger in Modal */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-dark-surface uppercase tracking-wider flex items-center justify-between">
                  <span>Monitored Patterns &amp; Current Frequency</span>
                  <span className="text-[10px] text-text-muted font-mono">{keywordFrequencyStats.length} vectors tracked</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {keywordFrequencyStats.map((k) => (
                    <div
                      key={k.keyword}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        k.isSpiking
                          ? 'bg-critical-red/10 border-critical-red/40 text-critical-red font-bold'
                          : 'bg-surface-canvas border-border-subtle text-dark-surface'
                      }`}
                    >
                      <span>'{k.keyword}'</span>
                      <span className="font-mono font-bold">
                        {k.count} {k.isSpiking ? 'âš¡ SPIKE' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
  
              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInjectWaterloggingSpike}
                    className="px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                  >
                    + Inject Waterlogging
                  </button>
                  <button
                    type="button"
                    onClick={handleInjectRoadDamageSpike}
                    className="px-2.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-semibold hover:bg-amber-100 transition-colors"
                  >
                    + Inject Road Damage
                  </button>
                </div>
  
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      executeAgentScan(grievances, selectedCity.name);
                      showToast('Scan triggered.');
                    }}
                    className="px-3.5 py-1.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-sm"
                  >
                    Run Scan Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAgentConsoleOpen(false)}
                    className="px-3 py-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-text-body font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* TICKET DETAIL INSPECTION DRAWER / MODAL */}
        {inspectingTicket && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-card rounded-2xl max-w-2xl w-full border border-border-subtle shadow-2xl overflow-hidden animate-scale-up space-y-4 p-space-lg">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-citation-ref text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        inspectingTicket.severity === 'critical'
                          ? 'bg-critical-red/10 text-critical-red border-critical-red/20'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}
                    >
                      {inspectingTicket.severity.toUpperCase()}
                    </span>
                    <span className="font-mono text-sm font-bold text-primary">
                      {inspectingTicket.ticketNumber}
                    </span>
                    <span className="text-text-muted text-xs font-citation-ref">
                      â€¢ Ingested {inspectingTicket.timestamp}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-lg font-bold text-dark-surface">
                    {inspectingTicket.issue}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingTicket(null)}
                  className="p-1 rounded-lg hover:bg-surface-canvas text-text-muted hover:text-dark-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
  
              {/* Description & Spatial Details */}
              <div className="space-y-3">
                <div className="p-3 bg-surface-canvas rounded-lg border border-border-subtle font-body-default text-xs sm:text-sm text-dark-surface leading-relaxed">
                  {inspectingTicket.description}
                </div>
  
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-surface-canvas rounded-lg border border-border-subtle">
                    <div className="text-[10px] font-citation-ref text-text-muted uppercase">Location Ward</div>
                    <div className="font-medium text-dark-surface pt-0.5">{inspectingTicket.ward}</div>
                  </div>
                  <div className="p-2.5 bg-surface-canvas rounded-lg border border-border-subtle">
                    <div className="text-[10px] font-citation-ref text-text-muted uppercase">Responsible Dept</div>
                    <div className="font-medium text-dark-surface pt-0.5">{inspectingTicket.department}</div>
                  </div>
                  <div className="p-2.5 bg-surface-canvas rounded-lg border border-border-subtle">
                    <div className="text-[10px] font-citation-ref text-text-muted uppercase">SLA Target Delta</div>
                    <div className={`font-mono font-bold pt-0.5 ${inspectingTicket.slaBreached ? 'text-critical-red' : 'text-emerald-700'}`}>
                      {inspectingTicket.slaBreached ? `+${inspectingTicket.slaOverdueHours}h Overdue` : `${inspectingTicket.slaHours}h Compliant`}
                    </div>
                  </div>
                  <div className="p-2.5 bg-surface-canvas rounded-lg border border-border-subtle">
                    <div className="text-[10px] font-citation-ref text-text-muted uppercase">Citizen Co-Reporters</div>
                    <div className="font-mono font-bold text-dark-surface pt-0.5">{inspectingTicket.reportedByCount} reports</div>
                  </div>
                  <div className="p-2.5 bg-surface-canvas rounded-lg border border-border-subtle">
                    <div className="text-[10px] font-citation-ref text-text-muted uppercase">Assigned Unit</div>
                    <div className="font-medium text-dark-surface pt-0.5">{inspectingTicket.dispatchUnit || 'Unassigned'}</div>
                  </div>
                  <div className="p-2.5 bg-surface-canvas rounded-lg border border-border-subtle">
                    <div className="text-[10px] font-citation-ref text-text-muted uppercase">Confidence Index</div>
                    <div className="font-mono font-bold text-emerald-700 pt-0.5">{inspectingTicket.verificationConfidence}%</div>
                  </div>
                </div>
  
                {/* Action Taken Audit Trail */}
                {inspectingTicket.actionTaken && (
                  <div className="p-3 bg-brand-tint/60 rounded-lg border border-primary/20 space-y-1">
                    <div className="text-[11px] font-citation-ref text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                      <span>Field Action &amp; Dispatch Audit Trail</span>
                    </div>
                    <p className="text-xs text-dark-surface leading-relaxed">
                      {inspectingTicket.actionTaken}
                    </p>
                  </div>
                )}
  
                {/* Linked Official Citations */}
                <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-citation-ref text-text-muted">LINKED EVIDENCE:</span>
                    {inspectingTicket.linkedSourceIds.map((srcId) => (
                      <CitationQuickGlance
                        key={srcId}
                        identifier={srcId}
                        label={`Inspect Source [${srcId}]`}
                        source={sourceLookup.get(srcId)}
                        onInspectFullCitation={(id) => {
                          setInspectingTicket(null);
                          onInspectCitation(id);
                        }}
                      />
                    ))}
                  </div>
  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInspectingTicket(null);
                        if (onLaunchWebSearch) {
                          onLaunchWebSearch(`${inspectingTicket.issue} in ${inspectingTicket.ward}`, inspectingTicket.city);
                        } else {
                          onNavigate('web-intelligence');
                        }
                      }}
                      className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">search</span>
                      <span>Web Investigation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* MODAL: INGEST NEW CIVIC GRIEVANCE TELEMETRY */}
        {isNewTicketModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-card rounded-2xl max-w-lg w-full border border-border-subtle shadow-2xl overflow-hidden p-space-lg space-y-4">
              <div className="flex items-start justify-between border-b border-border-subtle pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-headline-sm text-base font-bold text-dark-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">add_alert</span>
                    <span>Ingest Civic Grievance Telemetry</span>
                  </h3>
                  <p className="text-xs text-text-muted">
                    Simulate or manually register citizen 311 escalation into {selectedCity.name} telemetry grid.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-canvas text-text-muted hover:text-dark-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
  
              <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-dark-surface">Issue Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unscheduled Bus Fleet Deficit or SCADA Water Line Collapse"
                    value={newTicketForm.issue}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, issue: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-lg text-dark-surface outline-none focus:border-primary text-xs"
                  />
                </div>
  
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-dark-surface">Municipal Ward / Zone</label>
                    <input
                      type="text"
                      value={newTicketForm.ward}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, ward: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-lg text-dark-surface outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-dark-surface">Severity Tier</label>
                    <select
                      value={newTicketForm.severity}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, severity: e.target.value as any })}
                      className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-lg text-dark-surface outline-none focus:border-primary text-xs cursor-pointer"
                    >
                      <option value="critical">Critical (Immediate SLA &lt; 12h)</option>
                      <option value="high">High (SLA 24h)</option>
                      <option value="medium">Medium (SLA 48h)</option>
                      <option value="low">Low (Routine)</option>
                    </select>
                  </div>
                </div>
  
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-dark-surface">Category</label>
                    <select
                      value={newTicketForm.category}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-lg text-dark-surface outline-none focus:border-primary text-xs cursor-pointer"
                    >
                      <option value="Transit & Mobility">Transit &amp; Mobility</option>
                      <option value="Air Quality & Emissions">Air Quality &amp; Emissions</option>
                      <option value="Water Supply & SCADA">Water Supply &amp; SCADA</option>
                      <option value="Sanitation & Solid Waste">Sanitation &amp; Solid Waste</option>
                      <option value="Roads & Infrastructure">Roads &amp; Infrastructure</option>
                      <option value="Public Health & Clinics">Public Health &amp; Clinics</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-dark-surface">Responsible Agency</label>
                    <input
                      type="text"
                      value={newTicketForm.department}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, department: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-lg text-dark-surface outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>
  
                <div className="space-y-1">
                  <label className="font-semibold text-dark-surface">Grievance Narrative / Sensor Readings</label>
                  <textarea
                    rows={3}
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                    placeholder="Detailed telemetry, caller report specifics, or SCADA sensor values..."
                    className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-lg text-dark-surface outline-none focus:border-primary text-xs resize-none"
                  />
                </div>
  
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketModalOpen(false)}
                    className="px-3 py-2 rounded-lg text-text-muted hover:text-dark-surface font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-sm"
                  >
                    Broadcast to Feed
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };
