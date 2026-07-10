-- =====================================
-- Create Blue User
-- =====================================

CREATE USER blue_user WITH PASSWORD 'blue_password';

-- =====================================
-- Create Green User
-- =====================================

CREATE USER green_user WITH PASSWORD 'green_password';

-- =====================================
-- Create Databases
-- =====================================

CREATE DATABASE threetierapp_blue
    OWNER blue_user;

CREATE DATABASE threetierapp_green
    OWNER green_user;