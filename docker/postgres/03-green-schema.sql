\connect threetierapp_green

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL
);

INSERT INTO employees (name, email, department) VALUES
('Alice Johnson','alice.johnson@example.com','Engineering'),
('Bob Smith','bob.smith@example.com','Marketing'),
('Carla Diaz','carla.diaz@example.com','Human Resources'),
('David Lee','david.lee@example.com','Finance'),
('Emma Brown','emma.brown@example.com','Engineering')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE employees OWNER TO green_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO green_user;