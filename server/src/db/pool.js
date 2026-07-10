const { Pool } = require('pg');

// These 5 variables are the contract with the outside world:
// - In docker-compose, DB_HOST is set to "postgres" (the service name).
// - In local dev, DB_HOST is "localhost" (see server/.env.example).
// The pool itself never needs to know which environment it's in.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;
