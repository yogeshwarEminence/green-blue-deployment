-- Run this once against your Postgres database to set up the schema.
-- Example: psql -U postgres -d threetierapp -f schema.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  role VARCHAR(60) NOT NULL DEFAULT 'Member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A little seed data so the page isn't empty on first run
INSERT INTO users (name, email, role) VALUES
  ('Ava Thompson', 'ava.thompson@example.com', 'Admin'),
  ('Liam Chen', 'liam.chen@example.com', 'Editor'),
  ('Sofia Rossi', 'sofia.rossi@example.com', 'Member')
ON CONFLICT (email) DO NOTHING;
