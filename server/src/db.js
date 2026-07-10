const { Pool } = require('pg');

// All values come from environment variables so the SAME code works
// locally, inside Docker, and later on EC2 - only the .env changes.
const pool = new Pool({
  host: process.env.DB_HOST,       // "postgres" inside Docker, "localhost" if you run the server outside Docker
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;
