import { Investigation, Finding, Source, AgentLog, ExecutionStep, CausalNode } from '../types';

export const ASSETS = {
  logo: 'https://lh3.googleusercontent.com/aida/AEtjO1XbL3PfjDSP3K4ueFoi32fC_t82Ta_lTGGJ__yljM1e6jSxRmWn7WmidXDUxNOXxbzRgR_TsZZlyf3MtuPgi4RlHt7hNcNYsWLKIWao0M9bGsIT2oZUXXuBEypZjB29iGqRt_UNz8SlAFDqz6D7rHRf2_txy_87TXSvLrQVl1VdN2vXZ4a9dTIIiYMM869nwyetR6rUdPw93wCcDnE-q_dJh-SeZtN__b2jAFKDreFiVW-kvXKFGezeqtpm',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKC0Ba0ruGEkwrk88JphoC9ySGwKlx-f-DHYNLxkQhBFVCw07kMlPmPO_9REgbARRBWwTatUT0AXjs6c0PlICJC9aWKezIiO8pz_Xqhx7ApJx8o7i5UgaWSRP6HwZavCGfCzEVHHlLonuO--mSZZz_cw4VqUelqjQW-En2tLM_hNqISw5ScAUrcvdn7gOaq3_bbDYGMtT1Ulocknsj0Ir2VuXsiU4HYJC0k-2Ksv6WQ1Cbq6Ytpsu0aA',
  eastDelhiMap: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCls9qcduFsgzHmPWPHnzYKT66p1LPkHLn-eZqKLctXhVqTNkyCnFzEduUh1KSsrCMgdUFYdVWWBl0UUJugGqRchg-6BGxzB2cJAq96cTJhB6sPXPxfXKNu4eUK1e--fzv9WLssJ9kescPgMZQyWcm_e4Gfng7Hsac8zZtdHG1u2R4oApHCruz2Fm6Da5JoNLFdrsypqEtQbTkoX2U8SkdjBw0amV3ur_FsfBjW2ED_O3x48XUx4bkizA',
  docPdfThumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZpxqiq5U902b8EVse_j_1RcluIzRVJF3hJy7fZj7Gbw2O7rMOi-bA5myliW1zBENCwOYYhHI5wy01tVGTiTMY1wusJGNlp41uIgo4zMzf-pb1bcFoRc9sE15z4UuyY5vZnHDe9pFTcYqcYD8APIjPXNKkgSAmk_2PkgTi_6_NQjh7fjrdTPNm33GMNvbS9flkJ1s6iG4g3hAtBrUBjDQHZarj9hAh9afJ6FImtPFre0kmeBzeqmfhug',
  shahdaraMap: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5W7akQCHlfzj9-XPbwU_6gWug4WMmmVHZzWp0JNmzcCMSjbF1QHOKvMtMIeU55Q_wpE7FTfqxsu7nYOduSFIf1wAR-4stazxyuLE-vDi-1-relsrpczsxDLo-wY8IYWWFLyvGO4rjFxuG2mQK31WKINIb6KULsxa981d7uXoh39zNue85U4HuPCXlDrSh5Ju8bXjD3v36X1nFretTbI7uy3D33bgsj5xE2nhFS3CgQnIxE22W1Yls4g'
};

export const INITIAL_INVESTIGATIONS: Investigation[] = [
  {
    id: 'inv-1',
    code: 'INV-2025-089',
    title: 'Transportation & Mobility Bottlenecks in NCT Delhi',
    targetScope: 'Spatial distribution of DTC bus fleets vs 311 commuter grievances across 272 wards (2022–2025)',
    sessionToken: 'UR-NCT-9941',
    progress: 75,
    status: 'running',
    domain: 'transportation',
    domainLabel: 'Transportation & Mobility',
    city: 'NCT Delhi, IN',
    rigorTier: 'Tier-1 Audits',
    spatialUnit: '272 Wards GIS',
    summary: 'Discovered structural mismatches between bus fleet distribution and passenger boardings in East & North-East wards, driving a 34.2% peak-hour service deficit documented across Delhi Transport Corporation operational reports.',
    citations: ['CAG-DEL-2024', 'DTC-DATA-Q3', 'MCD-GPS-FLEET'],
    sourceDepth: 32,
    sourceList: 'DTC, CAG, OpenData',
    keyFindingsCount: 8,
    highStrengthCount: 4,
    auditChronology: 'Oct 24, 2026',
    auditDate: 'Oct 24, 2026',
    updatedAgo: 'Updated 2h ago',
    affectedWards: ['North-East Ward 14', 'East Ward 22', 'Shahdara South', 'Seelampur']
  },
  {
    id: 'inv-2',
    code: 'INV-2025-086',
    title: 'Solid Waste Collection Gaps & Overflow Hotspots',
    targetScope: 'MCD municipal weighbridge logs cross-audited against 311 citizen grievance escalations in East Delhi',
    sessionToken: 'UR-MCD-8812',
    progress: 100,
    status: 'completed',
    domain: 'waste',
    domainLabel: 'Waste Management & Sanitation',
    city: 'East Delhi (MCD)',
    rigorTier: 'Tier-1 Audits',
    spatialUnit: 'East MCD Wards',
    summary: 'Cross-referenced CAG municipal audit findings with 311 municipal grievance logs, identifying a 42% unresolved sanitation ticket cluster directly linked to privatized contractor fleet turnover in Ghazipur cluster wards.',
    citations: ['MCD-311-LOGS', 'SBM-AUDIT-24', 'CAG-MUNICIPAL'],
    sourceDepth: 24,
    sourceList: 'MCD Audit, 311 Logs',
    keyFindingsCount: 6,
    highStrengthCount: 5,
    auditChronology: 'Oct 23, 2026',
    auditDate: 'Oct 23, 2026',
    updatedAgo: 'Updated 1d ago',
    affectedWards: ['East MCD Zone 3', 'Patparganj Industrial Area', 'Ward 27']
  },
  {
    id: 'inv-3',
    code: 'INV-2025-081',
    title: 'Water Supply Inequity & Tanker Dependency',
    targetScope: 'DJB bulk SCADA flow meter telemetry vs commercial private tanker dispatch billing logs in Outer Delhi',
    sessionToken: 'UR-DJB-7120',
    progress: 100,
    status: 'completed',
    domain: 'water',
    domainLabel: 'Water & Sewerage',
    city: 'Outer Delhi',
    rigorTier: 'Tier-1 Audits',
    spatialUnit: 'Outer Delhi Colonies',
    summary: 'Identified artificial supply deficit in peripheral wards through mismatch in bulk flow meter telemetry vs commercial private tanker dispatch billing logs, causing an estimated 61% markup burden on vulnerable informal colonies.',
    citations: ['DJB-SCADA-FLOW', 'TANKER-GPS-LOGS', 'CENSUS-WARD-2021'],
    sourceDepth: 19,
    sourceList: 'DJB Flow, Census Layers',
    keyFindingsCount: 5,
    highStrengthCount: 3,
    auditChronology: 'Oct 21, 2026',
    auditDate: 'Oct 21, 2026',
    updatedAgo: 'Updated 3d ago',
    affectedWards: ['Bawana Sector 3', 'Narela Feeder', 'Kirari Extension']
  },
  {
    id: 'inv-4',
    code: 'INV-2025-078',
    title: 'Primary Healthcare Clinic Disparities & Drug Stockouts',
    targetScope: 'State health warehouse reserve allocations vs Mohalla clinic dispensary logbooks and patient prescription delays',
    sessionToken: 'UR-DHS-6490',
    progress: 100,
    status: 'completed',
    domain: 'health',
    domainLabel: 'Public Health',
    city: 'South-West Delhi',
    rigorTier: 'Tier-1 Audits',
    spatialUnit: 'South-West Clinics',
    summary: 'Discovered systemic pharmaceutical procurement supply-chain fractures resulting in an acute 58% essential drug stockout duration across peri-urban primary health clinics despite budgeted state warehouse reserves.',
    citations: ['DGHS-PROCURE-24', 'CLINIC-LEDGERS-SW', 'NHM-AUDIT-DEL'],
    sourceDepth: 28,
    sourceList: 'Mohalla Ledgers, Logs',
    keyFindingsCount: 7,
    highStrengthCount: 5,
    auditChronology: 'Oct 19, 2026',
    auditDate: 'Oct 19, 2026',
    updatedAgo: 'Updated 5d ago',
    affectedWards: ['Najafgarh Rural', 'Dwarka Sector 19', 'Palam Extension']
  }
];

export const SOURCES: Source[] = [
  {
    id: 'src-1',
    identifier: 'SRC-01',
    title: 'Delhi Transport Dept Operational Review 2024',
    documentType: 'Govt Report (PDF)',
    meta: 'Govt NCT of Delhi • Dept of Transport • Document Ref #TR-2024-88A',
    reliabilityTier: 'Tier-1 Verified',
    summary: 'Official annual fleet utilization audit containing depot-wise morning & evening pull-out ratios.',
    citedPages: 'Pages 42–47 Cited',
    findingsLinkedCount: 14,
    sha256: '8a7f9c2e4b31a89c72190f845a90d81b439e24f7c68102a4bf73295819d41b',
    pageNumber: 'Page 44, Paragraph 2',
    category: 'Govt Reports',
    verbatimExcerpt: '"...while Rohini and Dwarka clusters reported 98.4% assigned bus turnover during peak morning departures, Wards 14, 22, and adjacent East Delhi sectors operated under a 34.2% fleet shortfall due to unscheduled chassis maintenance transfers to Central Workshop 2."',
    verificationRole: 'Primary Empirical Driver',
    keyExtractedMetric: {
      metric: '34.2% Fleet Deficit',
      desc: 'Peripheral depot allocation failure'
    },
    fileSize: '4.8 MB',
    docId: 'DTC-GOV-2024-DEL-9182'
  },
  {
    id: 'src-2',
    identifier: 'SRC-02',
    title: 'MCD 311 Grievance Database (2022–2025)',
    documentType: 'Public Telemetry (CSV)',
    meta: 'Municipal Corporation of Delhi • API Telemetry Stream • Ward Resolution Grid',
    reliabilityTier: 'OpenData API',
    summary: 'High-frequency civic complaints log geo-coded with timestamp, department tag, and resolution delta.',
    citedPages: '1.42M Rows Analyzed',
    findingsLinkedCount: 8,
    sha256: 'b492f170a83e0129cdfa69910d54a7ec9183017a42ec780918ef025c81fa1209',
    pageNumber: 'Live GeoJSON Endpoint',
    category: 'Datasets',
    verbatimExcerpt: '"Aggregated civic transit incident reports logged via 311 mobile endpoints denote 14,820 commuter delays registered in Mayur Vihar, Anand Vihar, and Shahdara blocks with average ticket closure time lagging standard 48-hour SLAs by +214%."',
    verificationRole: 'Citizen Impact Metric',
    keyExtractedMetric: {
      metric: '14,820 Complaints',
      desc: 'Commute wait times > 45 mins'
    },
    fileSize: '184 MB',
    docId: 'MCD-API-311-GEO-2025'
  },
  {
    id: 'src-3',
    identifier: 'SRC-03',
    title: 'CAG Performance Audit on Urban Transit Infrastructure',
    documentType: 'Govt Audit (PDF)',
    meta: 'Comptroller and Auditor General of India • Report No. 14 of 2023 • Delhi Division',
    reliabilityTier: 'Tier-1 Verified',
    summary: 'Comptroller and Auditor General parliamentary assessment on terminal expansion & bus turnaround efficiency.',
    citedPages: 'Page 112 Cited',
    findingsLinkedCount: 6,
    sha256: '9f041cb3a89091ef74839201bcfa9480112938475a892019bcae984710293847',
    pageNumber: 'Page 112, Para 4.18',
    category: 'Audits',
    verbatimExcerpt: '"Para 4.18: Audit scrutiny of fleet log registers revealed that operational scheduled trips failed to materialize in 38 of 48 surveyed peripheral routes. Failure to operationalize 6 planned terminal layovers in Trans-Yamuna resulted in idle fleet dead-mileage costs exceeding ₹38.4 Crore, severely degrading off-peak headway frequency across Wards 14 through 29."',
    verificationRole: 'Root Cause Statutory Confirmation',
    keyExtractedMetric: {
      metric: 'Depots Unassigned',
      desc: 'Sanctioned fleet non-operational'
    },
    fileSize: '12.4 MB',
    docId: 'CAG-IND-AUD-DEL-MOB-2024'
  },
  {
    id: 'src-4',
    identifier: 'SRC-04',
    title: 'Delhi Ward Spatial Demographics Layer (Census 2021-2024)',
    documentType: 'GIS Demographics (SHP)',
    meta: 'Delhi Development Authority (DDA) GIS Portal • Census Division Overlay',
    reliabilityTier: 'Spatial Vector',
    summary: 'Polygon boundary sets with socio-economic indicators and formal transit catchment zones for Ward 14–29.',
    citedPages: 'GeoJSON Boundary: 272 Wards',
    findingsLinkedCount: 7,
    sha256: '49e810abf1092837491029384756102938475610293847561029384756102938',
    pageNumber: 'Layer Feature ID #DEL-W14-29',
    category: 'GIS Layer',
    verbatimExcerpt: '"Spatial polygon demographic overlay affirms East Delhi peripheral wards expanded resident population density by +22.4% over four fiscal cycles, outpacing scheduled bus route allocations by an inverse factor of 2.4."',
    verificationRole: 'Spatial Demand Baseline',
    keyExtractedMetric: {
      metric: '+22.4% Density Growth',
      desc: 'Trans-Yamuna sub-cities expansion'
    },
    fileSize: '42.1 MB',
    docId: 'DDA-GIS-MPD-2041-V4'
  },
  {
    id: 'src-5',
    identifier: 'SRC-05',
    title: 'DTC Automated Fare Collection (AFC) Ticketing Stream',
    documentType: 'Operational Ticketing (Parquet)',
    meta: 'Delhi Integrated Multi-Modal Transit System • Smart Card Transactions',
    reliabilityTier: 'Tier-1 Operational',
    summary: 'Electronic ticketing terminal transaction streams with tap-in tap-out terminal timestamps across bus stops.',
    citedPages: 'Q2-Q3 2024 Complete Log',
    findingsLinkedCount: 5,
    sha256: '38a9b0c1e8273645192837465019283746501928374650192837465019283746',
    pageNumber: 'Terminal Log Cluster 08',
    category: 'Datasets',
    verbatimExcerpt: '"Peak morning boarding interchange surge logged 4,200 passengers per hour at Anand Vihar ISBT feeder hub without corresponding shuttle headway releases from Ghazipur sub-depot."',
    verificationRole: 'Demand Pressure Corroboration',
    keyExtractedMetric: {
      metric: '4,200 Passengers / Hr',
      desc: 'Peak morning interchange surge'
    },
    fileSize: '310 MB',
    docId: 'DIMTS-AFC-Q3-2024'
  }
];

export const WORKFLOW_STEPS: ExecutionStep[] = [
  {
    stepNumber: 1,
    title: '1. Question Deconstruction',
    status: 'COMPLETE',
    description: 'Decomposed into 4 target indicators: fleet allocation, passenger boardings, 311 delay complaints, depot capacity.'
  },
  {
    stepNumber: 2,
    title: '2. Source Discovery',
    status: 'COMPLETE',
    description: 'Indexed 32 official documents (DTC Operational Review, CAG Audit 2024, MCD OpenData).'
  },
  {
    stepNumber: 3,
    title: '3. Data Ingestion & Normalization',
    status: 'COMPLETE',
    description: 'Ingested 14,200 GPS route records and 1.42M grievance rows into spatial raster matrix.'
  },
  {
    stepNumber: 4,
    title: '4. Cross-Source Relational Analysis',
    status: 'RUNNING',
    description: 'Correlating peak delay complaints with depot fleet deficits in Ward 14–29.',
    detail: 'Evaluating 18 Pearson regression passes...'
  },
  {
    stepNumber: 5,
    title: '5. Evidence Verification',
    status: 'QUEUED',
    description: 'Testing statistical confidence against Tier-1 CAG benchmarks (Threshold: 90%+).'
  },
  {
    stepNumber: 6,
    title: '6. Research Report Synthesis',
    status: 'QUEUED',
    description: 'Formatting findings with inline citations and policy recommendations.'
  }
];

export const AGENT_LOGS: AgentLog[] = [
  {
    id: 'log-1',
    agentCode: 'S0',
    agentName: 'Supervisor Agent',
    timestamp: '14:02:11 IST',
    message: 'Decomposed urban query into spatial sub-tasks. Assigned DTC fleet schedules to Document Intelligence Agent and 311 grievance logs to Data Analysis Agent.',
    task: 'Task: Spatial Decomposition',
    latency: 'Latency: 410ms',
    badgeBg: 'bg-primary-fixed',
    badgeText: 'text-primary'
  },
  {
    id: 'log-2',
    agentCode: 'D1',
    agentName: 'Document Intelligence Agent',
    timestamp: '14:02:45 IST',
    message: 'Extracted Pages 42–47 of Delhi Transport Dept Operational Review 2024 [SRC-01]. Identified explicit finding: "Peak hour fleet deficit in North-East sector reached 34.2% due to unassigned depot transfers."',
    task: 'OCR Extraction: 99.4% Match',
    latency: '12 Tables Vectorized',
    badgeBg: 'bg-provenance-purple/15',
    badgeText: 'text-provenance-purple',
    highlightCitations: ['SRC-01']
  },
  {
    id: 'log-3',
    agentCode: 'A2',
    agentName: 'Data Analysis Agent',
    timestamp: '14:03:12 IST',
    message: 'Computed Pearson correlation between bus route trip cancellation rates and MCD 311 transit grievances across 48 wards. Result: r = 0.81 (p < 0.001) indicating systemic scheduling failure.',
    task: 'Correlation Matrix',
    latency: 'Latency: 520ms',
    badgeBg: 'bg-domain-water/20',
    badgeText: 'text-domain-water',
    stat: {
      label: 'Correlation Strength',
      value: 'r = +0.812',
      hasSparkline: true
    }
  },
  {
    id: 'log-4',
    agentCode: 'X3',
    agentName: 'Cross-Source Analyst Agent',
    timestamp: '14:03:55 IST',
    message: 'Synthesized Cross-Source Finding #01: Population growth (+22%) in East Delhi peripheral wards coincides with 18% bus cancellation rate and 14,820 commuter grievance tickets. Discrepancy confirmed by CAG Audit Page 112 [SRC-03].',
    task: 'FINDING #01 GENERATED',
    latency: '3 Independent Datasets Intersected',
    badgeBg: 'bg-primary text-on-primary',
    badgeText: 'text-on-primary',
    highlightCitations: ['SRC-03']
  },
  {
    id: 'log-5',
    agentCode: 'V4',
    agentName: 'Evidence Verification Agent',
    timestamp: '14:04:20 IST',
    message: 'Confidence Score: 96.8%. Multi-source verification validated against CAG empirical audits. Tagged Finding #01 as EVIDENCE STRENGTH: HIGH.',
    task: 'Verification Pass',
    latency: 'Audit SHA-256 Validated',
    badgeBg: 'bg-secondary text-on-secondary',
    badgeText: 'text-on-secondary',
    confidenceScore: 96.8
  }
];

export const FINDINGS: Finding[] = [
  {
    id: 'finding-1',
    findingNumber: 'FINDING #01',
    title: 'Public transport bus capacity is disproportionately deficit in high-density peripheral wards, causing a 34.2% peak-hour service shortfall.',
    narrative: 'Cross-referencing DTC bus route schedules with MCD 311 commuter grievance logs reveals a 34.2% operational fleet deficit during morning peak hours (08:00–10:30) in North-East and East Delhi wards, despite a 22% population increase in these wards since 2018 [1] [3]. CAG audit logs confirm unassigned depot transfers as the root mechanical driver [3].',
    confidence: 96.8,
    evidenceStrength: 'HIGH',
    citations: [
      { id: 'src-1', name: '[1] DTC Operational Review' },
      { id: 'src-3', name: '[3] CAG Audit Report' }
    ],
    sourceCountLabel: '4 Govt Reports • 3 Datasets • 3 Affected Wards',
    affectedWards: ['North-East Ward 14', 'East Ward 22', 'Shahdara South', 'Seelampur'],
    metrics: [
      {
        label: 'Peak Fleet Deficit',
        value: '34.2%',
        source: 'Source: DTC Operational Review 2024, Page 44',
        type: 'deficit'
      },
      {
        label: 'Monthly Grievance Vol.',
        value: '14,820',
        source: 'Source: MCD 311 Log, Q2-Q3 Active',
        type: 'volume'
      },
      {
        label: 'Statistical Correlation',
        value: 'r = 0.81',
        source: 'Strength: p < 0.001 (Spearman Rank)',
        type: 'correlation'
      }
    ],
    domain: 'transportation'
  },
  {
    id: 'finding-2',
    findingNumber: 'FINDING #02',
    title: 'Solid waste clearance delays show strong temporal correlation with private contractor fleet turnover in East MCD.',
    narrative: 'Combining municipal weighbridge dispatch ledgers with 311 sanitation tickets indicates an unresolved complaint rate of 42% in Ward 27 during Q3, matching a 28% drop in contractor collection vehicles documented in the municipal financial audit [2]. Ghazipur transfer station logs register 1,420 unweighed night trips with zero manifest certification.',
    confidence: 94.1,
    evidenceStrength: 'HIGH',
    citations: [
      { id: 'src-2', name: '[2] MCD Auditor General FY24' }
    ],
    sourceCountLabel: '3 Govt Reports • 2 Datasets • 2 Affected MCD Zones',
    affectedWards: ['East MCD Zone 3', 'Patparganj Industrial Area', 'Ward 27'],
    metrics: [
      {
        label: 'Unresolved Grievance Rate',
        value: '42.0%',
        source: 'Baseline citywide: 18.2% avg',
        type: 'alert'
      },
      {
        label: 'Contractor Fleet Drop',
        value: '-28.0%',
        source: 'Weighbridge Ingate Logs (Q3)',
        type: 'deficit'
      },
      {
        label: 'Discrepancy Audit Flag',
        value: 'TIER-1 VERIFIED',
        source: 'MCD Special Auditor Report Sec 9',
        type: 'verified'
      }
    ],
    domain: 'waste'
  },
  {
    id: 'finding-3',
    findingNumber: 'FINDING #03',
    title: 'Arterial Road Waterlogging Recurrence Coincides with Culvert Desilting Certification Lags.',
    narrative: 'Pre-monsoon drainage maintenance reports show formal desilting sign-offs lagged physical rain events by up to 54 calendar days across Ring Road nodes [4]. Real-time traffic sensor speed telemetry dropped by 74% at these exact 18 chronic inundation points during moderate showers (>15mm/hr) [5].',
    confidence: 87.5,
    evidenceStrength: 'MEDIUM',
    citations: [
      { id: 'src-4', name: '[4] PWD Culvert Maintenance Cert' },
      { id: 'src-5', name: '[5] Delhi Traffic Police Telemetry' }
    ],
    sourceCountLabel: '2 Govt Reports • 1 Sensor Stream • 18 Junctions',
    affectedWards: ['Ring Road Bypass', 'Moolchand Underpass', 'Kashmere Gate Hub'],
    metrics: [
      {
        label: 'Recurrent Inundation Hotspots',
        value: '18 Key Junctions',
        source: 'Corridor: Ring Road & Outer Bypass',
        type: 'volume'
      },
      {
        label: 'Certification Delay Window',
        value: '54 Days Lag',
        source: 'PWD Annual Drainage Compliance 2023-24',
        type: 'timer'
      }
    ],
    domain: 'water'
  }
];

export const CAUSAL_NODES: CausalNode[] = [
  {
    stageNumber: 1,
    stageName: 'STAGE 01',
    sourceTag: '[SRC-04]',
    title: 'Demographic Shift',
    subtitle: 'Spatial GIS Layer',
    metric: '+22.4%',
    metricDesc: 'Population growth in peripheral wards (2018–2024)',
    referenceDoc: 'DDA MPD-2041',
    type: 'demographic'
  },
  {
    stageNumber: 2,
    stageName: 'STAGE 02',
    sourceTag: '[SRC-05]',
    title: 'Transit Demand',
    subtitle: 'Operational Dataset',
    metric: '4,200/hr',
    metricDesc: 'Peak morning terminal passenger boarding volume',
    referenceDoc: 'DTC AFC Ticketing',
    type: 'demand'
  },
  {
    stageNumber: 3,
    stageName: 'STAGE 03 • ROOT CAUSE',
    sourceTag: '[SRC-01]',
    title: 'Fleet Bottleneck',
    subtitle: 'Govt Operational Review',
    metric: '-34.2%',
    metricDesc: 'Active bus fleet deficit vs. sanctioned ward allotment',
    referenceDoc: 'DoT Annual Review p.44',
    type: 'bottleneck'
  },
  {
    stageNumber: 4,
    stageName: 'STAGE 04 • CIVIC IMPACT',
    sourceTag: '[SRC-02]',
    title: 'Grievance Spike',
    subtitle: 'Public Grievance Telemetry',
    metric: '14,820',
    metricDesc: 'Transit delay & severe overcrowding 311 tickets',
    referenceDoc: 'MCD 311 Ward DB',
    type: 'impact'
  },
  {
    stageNumber: 5,
    stageName: 'STAGE 05 • SYNTHESIS',
    sourceTag: '[SRC-03]',
    title: 'Service Deficit',
    subtitle: 'Verified Problem',
    metric: 'CERTIFIED',
    metricDesc: 'Formal verification by CAG State Transport Audit',
    referenceDoc: 'Published to Brief',
    type: 'synthesis'
  }
];
