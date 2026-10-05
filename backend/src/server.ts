import { buildApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './database/prisma.js';

async function main() {
  const app = buildApp();

  // Attempt database connection
  await connectDatabase();

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}. Shutting down gracefully...`);
    try {
      await app.close();
      await disconnectDatabase();
      app.log.info('Server and database connections closed cleanly.');
      process.exit(0);
    } catch (err) {
      app.log.error(err, 'Error during graceful shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`UrbanPulse Backend running on http://${env.HOST}:${env.PORT}`);
    app.log.info(`OpenAPI Documentation available at http://${env.HOST}:${env.PORT}/api/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
