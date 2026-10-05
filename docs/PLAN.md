# UrbanPulse Platform: Architectural Plan & Integration Blueprint

This document details the frontend inspection, full data requirements per screen, mock data inventory, architectural gap analysis, and the multi-phase backend roadmap (Phases 1 through 6).

---

## 1. Frontend Screen & Data Inventory

| Screen / View | Navigation Path | UI Purpose & Visual Elements | Required Data Fields & Shapes |
|---|---|---|---|
| **Overview Dashboard** | `overview-dashboard` (`/`) | Evidence summary, domain filters, search ribbon, active investigation cards. | - `Investigation[]`: `id`, `code`, `title`, `domain`, `city`, `summary`, `citations`, `progress`, `sourceDepth`, `keyFindingsCount`, `highStrengthCount`, `auditDate`, `affectedWards`.<br>- Global summary metrics: Total sources indexed, verified findings, active streams. |
| **Research Workspace** | `research-workspace` | Autonomous investigation execution console: plan, agent log stream, document sources. | - `Investigation`: Active investigation metadata.<br>- `ExecutionStep[]`: `stepNumber`, `title`, `status`, `description`, `detail`.<br>- `AgentLog[]`: `id`, `agentCode`, `agentName`, `timestamp`, `message`, `task`, `latency`, `confidenceScore`.<br>- `Source[]`: `id`, `identifier`, `title`, `documentType`, `meta`, `reliabilityTier`, `verbatimExcerpt`, `sha256`. |
| **Discovered Findings** | `discoveries-and-findings` | Synthesized problems & corroborating evidence with GIS hotspot layers. | - `Finding[]`: `id`, `findingNumber`, `title`, `narrative`, `evidenceStrength`, `confidence`, `citations`, `affectedWards`, `metrics` (`label`, `value`, `source`).<br>- `Source`: Selected source PDF chunk inspector with SHA256 verification. |
| **Cross-Source Analysis** | `cross-source-analysis` | Topological causal graph & provenance matrix. | - `CausalNode[]`: `stageNumber`, `stageName`, `sourceTag`, `title`, `metric`, `metricDesc`, `type` (`demographic`, `demand`, `bottleneck`, `impact`, `synthesis`).<br>- Correlation stats ($r = 0.814$), Multi-source cross-reference table. |
| **Web Intelligence** | `web-intelligence` | 5-tab real-time search & urban intelligence console. | - `WebResearchResponse`: `executiveSummary`, `keyFindings`, `recentDevelopments`, `importantFacts`, `urbanImpact` (infrastructure, environmental, governance, citizens), `relevantLocations` (`lat`, `lng`, `name`), `sources`.<br>- `UrbanTrendAnalysis`: `timelineTrend` (period, frequency, intensity), `frequencyByCategory`, `severityDistribution`, `comparisonData`.<br>- Session History: Array of past search sessions with 1-click reopen. |
| **Civic Alert Center** | `alert-center` | Real-time municipal 311 telemetry, grievance feeds, disaster alerts, and spike detection. | - `CivicGrievanceLog[]`: `ticketNumber`, `city`, `ward`, `category`, `issue`, `severity`, `status`, `slaHours`, `reportedByCount`, `linkedSourceIds`, `coordinates` (`lat`, `lng`).<br>- `EmergencyUpdate[]`: `code`, `title`, `alertLevel`, `issuingAuthority`, `impactMetric`, `mandatoryDirectives`.<br>- `SpikeDetectionAlert[]`: `keyword`, `velocityMultiplier`, `matchedTicketCount`, `suggestedResearchQuestion`, `hypothesis`.<br>- `GrievanceScanAgentConfig`: Agent sentinel parameters. |
| **Data Analysis** | `data-analysis` | Econometric & spatial regressions, multi-source correlation matrices. | - `RegressionModel[]`: `dependentVariable`, `rSquared`, `pValue`, `coefficients`, `sampleSize`, `fStatistic`, `spatialLagCoefficient`.<br>- Audit records & citation hashes. |
| **Document Intelligence** | `document-intelligence` | OCR extraction, PDF chunk verification, and SHA-256 integrity inspection. | - Document metadata, checksums, verbatim snippets, confidence tiers. |
| **Sources & Datasets** | `sources-and-datasets` | Statutory catalogs, municipal open data repositories, and GIS layers. | - `DatasetCatalogItem[]`: `title`, `agency`, `recordsCount`, `updateCadence`, `format`, `status`. |
| **Research Reports** | `research-reports` | Saved briefs, synthesized reports, and export ledger. | - `ResearchReport[]`: `title`, `authors`, `abstract`, `keyFindingsCount`, `sourcesCount`, `downloadUrls`. |
| **Knowledge Graph** | `knowledge-graph` | Entity-relationship graph connecting citations, civic issues, and municipal laws. | - Node and edge topology matrices, centrality metrics. |

---

## 2. Hardcoded / Mock Data Inventory

The following files contain seeded/hardcoded data that will be progressively backed by database models and real ingestion providers:

1. **`src/data/mockData.ts`**:
   - `INITIAL_INVESTIGATIONS`: Mock investigations across Delhi transit, sanitation, water SCADA.
   - `INITIAL_FINDINGS`: Static problem discovery cards.
   - `INITIAL_SOURCES`: Mock statutory PDF excerpts (CAG, DTC, MCD) with SHA-256 hashes.
   - `INITIAL_AGENT_LOGS`: Mock agent telemetry and step execution timestamps.
   - `INITIAL_STEPS`: 5-step mock investigation workflow.
   - `CAUSAL_NODES`: 5-stage causal chain for cross-source analysis.

2. **`src/data/alertCenterData.ts`**:
   - `MONITORED_CITIES`: Static list of 8 cities (Delhi, Mumbai, Bengaluru, etc.).
   - `INITIAL_CIVIC_GRIEVANCES`: 30 static 311 grievance tickets.
   - `INITIAL_EMERGENCY_UPDATES`: Static advisories (e.g. GRAP Stage IV air quality emergency).
   - `HOURLY_INCIDENT_SURGE_DATA`: Static 24-hour surge bar chart data.
   - `CATEGORY_BREAKDOWN_DATA`: Static pie chart distributions.
   - `INITIAL_SPIKE_DETECTIONS`: Static simulated anomaly spikes (waterlogging, road damage).

3. **`src/data/analysisData.ts`**:
   - `DATASET_CATALOG`: Catalog of 12 static datasets.
   - `SAMPLE_RESEARCH_REPORTS`: 3 static executive reports.
   - `REGRESSION_MODELS_DATA`: Static OLS regression tables and correlation coefficients.
   - `KNOWLEDGE_GRAPH_DATA`: Static nodes and links for evidence mesh.

---

## 3. Gap Analysis: Spec vs. Frontend

| Feature / Dimension | Current Frontend Expectation | Backend Specification Requirement | Bridge / Resolution Strategy |
|---|---|---|---|
| **Urban Event Trends & Frequency** | Expects `UrbanTrendAnalysis` nested inside `/api/research/search` with timeline points, categories, and regional comparisons. | Spec focuses on sensor telemetry (`WeatherReading`, `AirQualityReading`, `EnvironmentalReading`). | Backend provides a dedicated analytical aggregator that aggregates live readings and municipal grievances into the exact `UrbanTrendAnalysis` shape. |
| **Web Intelligence Sourced Briefs** | Frontend requires rich executive summaries with 4-pillar urban impact (infrastructure, environmental, governance, citizens). | Spec defines raw environmental readings and research models. | Backend research adapter merges raw sensor telemetry and Gemini grounding into the structured `WebResearchResponse` format. |
| **Civic Grievances & Sentinel Spikes** | Frontend expects 311 grievance tickets with SLA metrics, ticket numbers, and automated keyword spike detections. | Spec specifies `Alert` and `Prediction` models. | Backend `Alert` and `IngestionJob` models include `CIVIC` category and support grievance correlation and spike alerting. |
| **Regional Comparisons** | Frontend expects comparison curves between primary city and comparative cities (e.g., Delhi vs Mumbai vs Bengaluru). | Spec models locations individually with PostGIS geometries. | Backend spatial aggregation route `/api/v1/analytics/regional-compare` computes comparative metrics across two location IDs. |
| **Citation Verification** | Frontend sends `POST /api/citation/verify` with `{ identifier, url }` and expects `{ status, docId, message, responseTimeMs }`. | Spec defines `CitationRecord` and `DataSource` with cryptographic hashes. | Backend implements `/api/citation/verify` with live HTTP HEAD probing and statutory SHA-256 checksum verification against `CitationRecord`. |

---

## 4. Multi-Phase Backend Implementation Roadmap

### Phase 1: Foundation (Current Phase)
- Initialize `backend/` with Fastify, strict TypeScript, Zod, Argon2, Pino, Swagger.
- Complete PostGIS database models in Prisma: `User`, `RefreshToken`, `Location`, `EnvironmentalReading`, `AirQualityReading`, `WeatherReading`, `SatelliteObservation`, `UrbanRisk`, `Prediction`, `Alert`, `ResearchProject`, `ResearchDataset`, `ResearchObservation`, `ResearchReport`, `DataSource`, `IngestionJob`, `AuditLog`, `SystemMetric`.
- PostGIS migration SQL and triggers syncing Point geometry with lat/lng.
- Auth endpoints (register, login, refresh with rotation/reuse detection, logout, me).
- Location management with PostGIS queries: `ST_DWithin` radius, bounding box (`ST_MakeEnvelope`), and nearest neighbor search.
- Health endpoints: `/api/v1/health` and `/api/v1/ready`.
- Database seeding: Admin user (password from env) and 8–10 realistic Indian cities with Point geometries.
- Unit and integration test suites passing.

### Phase 2: Sensor Ingestion & Environmental Core
- External integration providers: Open-Meteo (Weather), OpenAQ v3 (Air Quality), Copernicus/Landsat (Satellite optical & thermal indices).
- Indian CPCB NAQI calculation engine (pure, unit-tested).
- Rothfusz regression Heat Index calculation.
- Background ingestion queue and BullMQ worker entrypoint (`src/worker.ts`).

### Phase 3: Risk Prediction Engine & ML Service
- Standalone Python FastAPI microservice (`ml-service/`).
- Deterministic baseline vulnerability models (flood, heat, air pollution, water stress).
- Confidence calculation based on data completeness and freshness.
- Half-open risk range mapping ($[0,20)$ to $[80,100]$).
- Automated alert generation when hazard risk reaches Moderate, High, or Critical.

### Phase 4: Civic Telemetry & Anomaly Spike Detection
- 311 Grievance ingestion and SLA tracking.
- Anomaly detection agent sentinel for municipal ticket frequency spikes.
- Correlating grievances with spatial sensor anomalies.

### Phase 5: Web Intelligence, Research Engine & Citations
- Sourced research synthesis engine.
- Smart summary generator (AI interpretation).
- Cryptographic citation verification with statutory checksum matching.
- Shared research history ledger.

### Phase 6: Digital Twin & End-to-End System Integration
- Multi-layer spatial digital twin endpoints (GeoJSON polygons, heatmap grids).
- Full frontend switchover from mock data to live backend APIs.
- End-to-end integration and load testing.
