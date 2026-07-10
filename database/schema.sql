-- Runs automatically when the postgres container starts with an empty
-- data volume (mounted into /docker-entrypoint-initdb.d by docker-compose).
-- To re-run manually: psql -U postgres -d employee_management -f schema.sql

CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  department VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO employees (name, email, department) VALUES
  ('Ava Thompson',  'ava.thompson@example.com',  'Engineering'),
  ('Liam Chen',     'liam.chen@example.com',     'Product'),
  ('Sofia Rossi',   'sofia.rossi@example.com',   'Design'),
  ('Noah Patel',    'noah.patel@example.com',    'Marketing'),
  ('Maya Johnson',  'maya.johnson@example.com',  'Human Resources')
ON CONFLICT (email) DO NOTHING;
