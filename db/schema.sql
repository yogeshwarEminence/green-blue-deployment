-- This file is automatically executed by the official postgres Docker
-- image the FIRST time the container starts with an empty data volume
-- (it is mounted into /docker-entrypoint-initdb.d/).

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL
);

-- Seed data: 5 sample employees
INSERT INTO employees (name, email, department) VALUES
    ('Alice Johnson', 'alice.johnson@example.com', 'Engineering'),
    ('Bob Smith', 'bob.smith@example.com', 'Marketing'),
    ('Carla Diaz', 'carla.diaz@example.com', 'Human Resources'),
    ('David Lee', 'david.lee@example.com', 'Finance'),
    ('Emma Brown', 'emma.brown@example.com', 'Engineering')
ON CONFLICT (email) DO NOTHING;
