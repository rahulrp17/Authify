import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

let server;

const shutdown = async (signal) => {
  console.info(`[server] ${signal} received. Shutting down.`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await disconnectDB();
  process.exit(0);
};

const start = async () => {
  await connectDB(env.mongoUri);

  server = app.listen(env.port, () => {
    console.info(`[server] AUTHIFY API listening on port ${env.port} (${env.nodeEnv})`);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (error) => {
  console.error('[server] Unhandled rejection:', error);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  console.error('[server] Uncaught exception:', error);
  shutdown('uncaughtException');
});

start().catch((error) => {
  console.error('[server] Failed to start:', error.message);
  process.exit(1);
});
