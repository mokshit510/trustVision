import dotenv from 'dotenv';
import { app } from './app.js';
import { initDb } from './database/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize SQLite database schema
    await initDb();

    app.listen(PORT, () => {
      console.log(`TrustVision AI Safety Backend running on http://localhost:${PORT}`);
      console.log(`Healthcheck endpoint: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('Failed to start TrustVision server:', err);
    process.exit(1);
  }
}

startServer();
