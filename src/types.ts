export type NavigationPath = 
  | 'overview-dashboard'
  | 'research-workspace'
  | 'web-intelligence'
  | 'alert-center'
  | 'discoveries-and-findings'
  | 'cross-source-analysis'
  | 'data-analysis'
  | 'document-intelligence'
  | 'sources-and-datasets'
  | 'research-reports'
  | 'knowledge-graph'
  | 'research-history'
  | 'saved-research'
  | 'documentation'
  | 'settings';

export interface WebResearchSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  category: string;
  location: string;
  snippet?: string;
  date?: string;
}

export interface WebResearchFact {
  metric: string;
  context: string;
  source: string;
}

export interface WebResearchDevelopment {
  date: string;
  title: string;
  description: string;
}

export interface WebResearchLocation {
  name: string;
  district?: string;
  details: string;
  latitude: number | null;
  longitude: number | null;
  verifiedCoord?: boolean;
}

export interface UrbanEventTrendPoint {
  period: string;
  frequency: number;
  intensity?: number;
  baseline?: number;
  linkedSourceIds?: string[];
  keyEventHighlight?: string;
  specificEventCount?: number;
}

export interface UrbanEventCategoryFrequency {
  category: string;
  count: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  linkedSourceIds?: string[];
  keyEventHighlight?: string;
}

export interface UrbanEventSeverityPoint {
  severity: string;
  count: number;
  color?: string;
}

export interface RegionalComparisonCityData {
  city: string;
  label: string;
  state?: string;
  timelineTrend: UrbanEventTrendPoint[];
  frequencyByCategory: UrbanEventCategoryFrequency[];
  severityDistribution: UrbanEventSeverityPoint[];
  summary: string;
  keyMetric: string;
  incidentVelocity?: string;
}

export interface RegionalComparisonState {
  enabled: boolean;
  compareCity: string;
}

export interface UrbanTrendAnalysis {
  summary: string;
  metricLabel: string;
  timeframeUnit: string;
  timelineTrend: UrbanEventTrendPoint[];
  frequencyByCategory: UrbanEventCategoryFrequency[];
  severityDistribution: UrbanEventSeverityPoint[];
  keyEventVelocity?: string;
  comparisonData?: RegionalComparisonCityData;
}

export interface WebResearchResponse {
  id: string;
  query: string;
  location: string;
  category: string;
  timeRange: string;
  timestamp: string;
  formattedDate: string;
  executiveSummary: string;
  keyFindings: string[];
  recentDevelopments: WebResearchDevelopment[];
  importantFacts: WebResearchFact[];
  urbanImpact: {
    infrastructure: string;
    environmental: string;
    governance: string;
    citizens: string;
  };
  relevantLocations: WebResearchLocation[];
  conflictNotes: string;
  connectedUrbanContext: string;
  searchQueries: string[];
  sources: WebResearchSource[];
  trendAnalysis?: UrbanTrendAnalysis;
}

export interface Investigation {
  id: string;
  code: string;
  title: string;
  targetScope: string;
  sessionToken: string;
  progress: number;
  status: 'running' | 'completed' | 'paused';
  domain: 'transportation' | 'waste' | 'water' | 'health';
  domainLabel: string;
  city: string;
  rigorTier: string;
  spatialUnit: string;
  summary: string;
  citations: string[];
  sourceDepth: number;
  sourceList: string;
  keyFindingsCount: number;
  highStrengthCount: number;
  auditChronology: string;
  auditDate: string;
  updatedAgo: string;
  affectedWards: string[];
  metricHighlights?: {
    label: string;
    value: string;
    sub: string;
    alert?: boolean;
    color?: string;
  }[];
}

export interface Finding {
  id: string;
  findingNumber: string;
  title: string;
  narrative: string;
  confidence: number;
  evidenceStrength: 'HIGH' | 'MEDIUM' | 'LOW';
  citations: { id: string; name: string }[];
  sourceCountLabel: string;
  affectedWards: string[];
  metrics: {
    label: string;
    value: string;
    source: string;
    type?: 'deficit' | 'volume' | 'correlation' | 'alert' | 'timer' | 'verified';
  }[];
  domain: string;
}

export interface Source {
  id: string;
  identifier: string; // e.g. "SRC-01"
  title: string;
  documentType: string;
  meta: string;
  reliabilityTier: string;
  summary: string;
  citedPages: string;
  findingsLinkedCount: number;
  sha256: string;
  verbatimExcerpt: string;
  pageNumber: string;
  category: 'Govt Reports' | 'Datasets' | 'Audits' | 'GIS Layer';
  fullDocUrl?: string;
  verificationRole?: string;
  keyExtractedMetric?: {
    metric: string;
    desc: string;
  };
  fileSize?: string;
  docId?: string;
}

export interface AgentLog {
  id: string;
  agentCode: string;
  agentName: string;
  timestamp: string;
  message: string;
  task: string;
  latency: string;
  badgeBg: string;
  badgeText: string;
  highlightCitations?: string[];
  stat?: {
    label: string;
    value: string;
    hasSparkline?: boolean;
  };
  subtext?: string;
  confidenceScore?: number;
}

export interface ExecutionStep {
  stepNumber: number;
  title: string;
  status: 'COMPLETE' | 'RUNNING' | 'QUEUED';
  description: string;
  detail?: string;
}

export interface CausalNode {
  stageNumber: number;
  stageName: string;
  sourceTag: string;
  title: string;
  subtitle: string;
  metric: string;
  metricDesc: string;
  referenceDoc: string;
  type: 'demographic' | 'demand' | 'bottleneck' | 'impact' | 'synthesis';
}

export type GrievanceCategory = 
  | 'Transit & Mobility'
  | 'Sanitation & Solid Waste'
  | 'Water Supply & SCADA'
  | 'Air Quality & Emissions'
  | 'Roads & Infrastructure'
  | 'Public Health & Clinics'
  | 'Power & Public Safety';

export type GrievanceSeverity = 'critical' | 'high' | 'medium' | 'low';

export type GrievanceStatus = 
  | 'active'
  | 'escalated'
  | 'under_investigation'
  | 'dispatched'
  | 'resolved';

export interface CivicGrievanceLog {
  id: string;
  ticketNumber: string;
  timestamp: string;
  relativeTime: string;
  city: string;
  ward: string;
  category: GrievanceCategory;
  department: string;
  issue: string;
  description: string;
  severity: GrievanceSeverity;
  status: GrievanceStatus;
  slaHours: number;
  slaBreached: boolean;
  slaOverdueHours?: number;
  reportedByCount: number;
  linkedSourceIds: string[];
  linkedCitations?: string[];
  coordinates?: { lat: number; lng: number };
  actionTaken?: string;
  verificationConfidence: number;
  dispatchUnit?: string;
}

export type EmergencyAlertLevel = 
  | 'RED_ALERT'
  | 'AMBER_ADVISORY'
  | 'YELLOW_WATCH'
  | 'INFO_BULLETIN';

export interface EmergencyUpdate {
  id: string;
  code: string;
  city: string;
  title: string;
  summary: string;
  alertLevel: EmergencyAlertLevel;
  issuingAuthority: string;
  effectiveFrom: string;
  expiresAt: string;
  affectedZones: string[];
  impactMetric: {
    label: string;
    value: string;
    subtext?: string;
    trend?: 'up' | 'down' | 'critical';
  };
  mandatoryDirectives: string[];
  linkedSourceIds: string[];
  status: 'active' | 'monitoring' | 'contained' | 'stood_down';
}

export interface SpikeDetectionAlert {
  id: string;
  code: string;
  city: string;
  keyword: string;
  patternLabel: string;
  detectedAt: string;
  relativeTime: string;
  matchedTicketCount: number;
  velocityMultiplier: string;
  affectedWards: string[];
  impactedCitizensEstimate: number;
  severity: 'critical' | 'high' | 'medium';
  suggestedResearchQuestion: string;
  hypothesis: string;
  linkedSourceIds: string[];
  matchedTicketIds: string[];
  status: 'active' | 'investigating' | 'dismissed' | 'resolved';
  confidenceScore: number;
}

export interface AgentScanLog {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  status: 'info' | 'scan' | 'spike_detected' | 'correlating';
  keyword?: string;
  matchCount?: number;
}

export interface GrievanceScanAgentConfig {
  enabled: boolean;
  scanIntervalSeconds: number;
  spikeThreshold: number;
  monitoredKeywords: string[];
  autoTriggerResearch: boolean;
}


