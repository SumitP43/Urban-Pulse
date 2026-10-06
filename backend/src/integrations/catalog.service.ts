import { prisma } from '../database/prisma.js';
import { Prisma } from '@prisma/client';

export interface DataSourceMetadata {
  provider: string;
  endpoint: string;
  lastSuccessfulSync?: string;
  lastFailure?: string;
  failureCount?: number;
  status?: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
}

export class DataSourceCatalogService {
  private registered = false;

  async ensureDefaultDataSources(): Promise<void> {
    if (this.registered) return;

    try {
      await prisma.dataSource.upsert({
        where: { code: 'open-meteo' },
        update: {},
        create: {
          code: 'open-meteo',
          name: 'Open-Meteo Weather Forecast API',
          agency: 'Open-Meteo (ECMWF, DWD, NOAA)',
          documentType: 'Meteorological Observations & Numerical Weather Prediction',
          reliabilityTier: 'Tier 1',
          isVerified: true,
          metadata: {
            provider: 'Open-Meteo GmbH',
            endpoint: 'https://api.open-meteo.com/v1/forecast',
            status: 'HEALTHY',
            failureCount: 0,
          } as Prisma.InputJsonValue,
        },
      });

      await prisma.dataSource.upsert({
        where: { code: 'openaq' },
        update: {},
        create: {
          code: 'openaq',
          name: 'OpenAQ Global Community Air Quality API',
          agency: 'OpenAQ Inc. / CPCB / EPA',
          documentType: 'In-Situ Ground Sensor Measurements',
          reliabilityTier: 'Tier 1',
          isVerified: true,
          metadata: {
            provider: 'OpenAQ Community Platform',
            endpoint: 'https://api.openaq.org/v3',
            status: 'HEALTHY',
            failureCount: 0,
          } as Prisma.InputJsonValue,
        },
      });

      this.registered = true;
    } catch (err) {
      // Degrade gracefully if DB is offline during startup/tests
      console.warn('[DATA_SOURCE] Could not initialize DataSource catalog table:', (err as Error).message);
    }
  }

  async recordJobStart(jobType: string, dataSourceCode: string, metadata?: Record<string, unknown>): Promise<string | null> {
    try {
      const source = await prisma.dataSource.findUnique({ where: { code: dataSourceCode } });
      const job = await prisma.ingestionJob.create({
        data: {
          dataSourceId: source?.id,
          jobType,
          status: 'PROCESSING',
          startedAt: new Date(),
          metadata: (metadata || {}) as Prisma.InputJsonValue,
        },
      });
      return job.id;
    } catch (err) {
      console.warn('[INGESTION_JOB] Failed to record job start:', (err as Error).message);
      return null;
    }
  }

  async recordJobSuccess(jobId: string | null, dataSourceCode: string, recordsIngested: number, metadata?: Record<string, unknown>): Promise<void> {
    try {
      if (jobId) {
        await prisma.ingestionJob.update({
          where: { id: jobId },
          data: {
            status: 'COMPLETED',
            recordsIngested,
            finishedAt: new Date(),
            metadata: (metadata || {}) as Prisma.InputJsonValue,
          },
        });
      }

      // Update data source health & last sync
      const source = await prisma.dataSource.findUnique({ where: { code: dataSourceCode } });
      if (source) {
        const currentMeta = (source.metadata as Record<string, unknown>) || {};
        await prisma.dataSource.update({
          where: { id: source.id },
          data: {
            metadata: {
              ...currentMeta,
              lastSuccessfulSync: new Date().toISOString(),
              status: 'HEALTHY',
              failureCount: 0,
            } as Prisma.InputJsonValue,
          },
        });
      }
    } catch (err) {
      console.warn('[INGESTION_JOB] Failed to record job success:', (err as Error).message);
    }
  }

  async recordJobFailure(jobId: string | null, dataSourceCode: string, error: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      if (jobId) {
        await prisma.ingestionJob.update({
          where: { id: jobId },
          data: {
            status: 'FAILED',
            errorMessage: error,
            finishedAt: new Date(),
            metadata: (metadata || {}) as Prisma.InputJsonValue,
          },
        });
      }

      const source = await prisma.dataSource.findUnique({ where: { code: dataSourceCode } });
      if (source) {
        const currentMeta = (source.metadata as Record<string, unknown>) || {};
        const count = ((currentMeta.failureCount as number) || 0) + 1;
        await prisma.dataSource.update({
          where: { id: source.id },
          data: {
            metadata: {
              ...currentMeta,
              lastFailure: new Date().toISOString(),
              lastFailureReason: error,
              failureCount: count,
              status: count >= 3 ? 'DEGRADED' : 'HEALTHY',
            } as Prisma.InputJsonValue,
          },
        });
      }
    } catch (err) {
      console.warn('[INGESTION_JOB] Failed to record job failure:', (err as Error).message);
    }
  }
}

export const catalogService = new DataSourceCatalogService();
