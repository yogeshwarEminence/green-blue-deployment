require('dotenv').config();
const app = require('./app');
const pool = require('./db/pool');
const ensureSchema = require('./db/ensureSchema');

const PORT = process.env.PORT || 4000;

// A small retry loop so the backend survives being started slightly
// before Postgres is ready to accept connections (docker-compose's
// healthcheck already prevents this in normal use, but this makes the
// service more resilient on its own too).
async function waitForDatabase(retries = 10, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1');
      console.log('Connected to PostgreSQL');
      return;
    } catch (err) {
      console.log(`Waiting for PostgreSQL... (attempt ${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Could not connect to PostgreSQL after multiple attempts');
}

async function start() {
  await waitForDatabase();
  await ensureSchema();

  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
