const pool = require('./pool');

// schema.sql runs automatically the FIRST time the postgres container
// starts with an empty volume. This function is just a safety net so
// the backend still works even if that init step was skipped
// (e.g. someone reused an old volume from a different project).
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      department VARCHAR(80) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = ensureSchema;
