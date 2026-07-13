\connect threetierapp_blue

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL
);

INSERT INTO employees (name, email, department) VALUES
('Tony Stark', 'tony.stark@starkindustries.com', 'Engineering'),
('Clark Kent', 'clark.kent@dailyplanet.com', 'Marketing'),
('Peter Parker', 'peter.parker@dailybugle.net', 'Human Resources'),
('Bruce Wayne', 'bruce.wayne@wayneenterprises.com', 'Finance'),
('Loki', 'loki@asgard.gov', 'Engineering');
ON CONFLICT (email) DO NOTHING;

ALTER TABLE employees OWNER TO blue_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO blue_user;