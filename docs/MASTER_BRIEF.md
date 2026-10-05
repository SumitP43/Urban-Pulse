# UrbanPulse Backend: Master Brief

## Project
UrbanPulse is an AI-powered urban intelligence and digital twin platform
(environment, air quality, weather, satellite indicators, risk prediction,
alerts, research, digital twin). The frontend ALREADY EXISTS in this repo.

## Absolute rules
1. Do NOT rebuild, redesign, or move the frontend. Do not break routes,
   components, charts, maps, filters, animations, or responsive layout.
2. Backend is built around what the ACTUAL frontend needs. If the frontend
   expects a response shape different from this spec, add a response adapter
   in the backend. Never change the frontend design to fit the backend.
3. No fake data presented as live. Every record has a `dataOrigin` enum:
   LIVE | SEED | DERIVED | PREDICTED. Seed data must be explicitly SEED.
4. No fake ML. No Math.random() scores, no invented confidence. If a model
   is not trained, it is a labeled baseline (`modelType: "baseline"`).
5. No placeholders: no TODO, no "not implemented", no stub routes that
   return []/null. Exception: a genuinely blocked external dependency, in
   which case build the provider abstraction + a clearly labeled dev
   fallback + document it.
6. Never claim something is verified unless you actually ran it. If Docker,
   Postgres, Redis or Python is unavailable, say exactly what was NOT tested.
7. Never commit secrets. Validate env vars at startup (Zod), fail fast.

## Stack (fixed)
Node.js + TypeScript (strict, no `any`) + Fastify, PostgreSQL + PostGIS,
Prisma, Redis, BullMQ, Zod, JWT access + rotating refresh tokens, Argon2,
RBAC (ADMIN, RESEARCHER, ANALYST, USER), Pino, Swagger/OpenAPI at
/api/docs, Vitest + Fastify inject, Docker + Docker Compose.
ML = separate Python FastAPI service (never coupled into Node).

## Structure
frontend stays where it is. Add:
backend/ (src/{config,modules,integrations,jobs,queues,middleware,plugins,
common,database,utils}, prisma/, tests/) , ml-service/ , docker-compose.yml.
Each module: routes, controller, service, repository, schema, types.
Small focused files. No giant controllers/services.

## Technical decisions (already made)
- Prisma has no native PostGIS support: use `Unsupported("geometry(...,4326)")`
  columns, custom migration SQL for `CREATE EXTENSION postgis` and GIST
  indexes, and `$queryRaw` with ST_DWithin / ST_Intersects / ST_MakeEnvelope /
  ST_Distance for all spatial queries. No distance math in JavaScript.
- Location: `geometry` (Point 4326) is the source of truth; latitude/longitude
  are kept in sync from it. Polygon/MultiPolygon boundary in a second column.
- Time: all timestamps UTC, SI units (°C, m/s, hPa, mm, µg/m³).
- Dedupe: unique key (locationId, timestamp, sourceId) on reading tables.
- AQI: Indian CPCB NAQI methodology (breakpoints for PM2.5, PM10, NO2, SO2,
  CO, O3; AQI = max sub-index; require min pollutants as per CPCB; categories
  Good/Satisfactory/Moderate/Poor/Very Poor/Severe). Pure, unit-tested function.
- Weather provider: Open-Meteo (free, keyless, has history + forecast).
  Behind a WeatherProvider interface.
- Air quality provider: OpenAQ v3 (API key via env) behind an
  AirQualityProvider interface, replaceable.
- Satellite: provider interface. Sentinel-2 gives NDVI/NDWI/NDBI only
  (via Copernicus Data Space or Sentinel Hub). Land Surface Temperature
  must come from Landsat 8/9 or MODIS, NOT Sentinel-2.
- EnvironmentalReading = derived/merged per-location snapshot (heatIndex,
  etc.). WeatherReading = raw provider weather. Document the difference.
- Risk levels use half-open ranges: [0,20) VERY_LOW, [20,40) LOW,
  [40,60) MODERATE, [60,80) HIGH, [80,100] CRITICAL.
  Map to alert severity: VERY_LOW/LOW -> LOW, MODERATE -> MEDIUM,
  HIGH -> HIGH, CRITICAL -> CRITICAL.
- Risk confidence reflects data completeness + freshness, never random.
  Flood/water-stress rules must document which inputs they use and lower
  confidence when inputs (elevation, drainage, imperviousness) are missing.
- Register always creates role USER. Only ADMIN can change roles.
  Refresh token: httpOnly secure cookie + also accepted in body for
  non-browser clients; stored hashed; rotation + reuse detection.
- API envelope: { success, data, meta } / { success:false, error:{code,message,details} }.
  Base path /api/v1. Centralized error handler, no stack traces in prod.
- BullMQ workers run in a separate process entrypoint (src/worker.ts),
  not inside the API process.
- Redis down => API keeps working (fail open, log warning); caching and
  rate limiting degrade gracefully.
- Node<->ML contract: one shared OpenAPI/JSON schema, with a contract test.
  ML responses include modelName, modelVersion, modelType, confidence,
  features, explanation, timestamp.

## Working method
- Build in phases. After each phase: typecheck, lint, tests, build must pass.
  Then STOP, write a short phase report (done / tested / not tested / next).
- Integrate the frontend per module as its backend API becomes complete.
- Commit per phase with a clear message.
