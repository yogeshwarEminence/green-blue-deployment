\connect threetierapp_green

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL
);

INSERT INTO employees (name, email, department) VALUES
('Walter White', 'walter.white@albuquerquechemistry.com', 'Engineering'),
('Thomas Shelby', 'thomas.shelby@shelbycompanylimited.com', 'Marketing'),
('Jon Snow', 'jon.snow@nightswatch.org', 'Human Resources'),
('Jonas Kahnwald', 'jonas.kahnwald@windennuclear.de', 'Finance'),
('Maeve Wiley', 'maeve.wiley@moordalehigh.edu', 'Engineering')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE employees OWNER TO green_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO green_user;