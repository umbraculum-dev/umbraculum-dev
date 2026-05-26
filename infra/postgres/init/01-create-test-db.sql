-- Create brewapp_test database on first container initialization.
-- This script only runs when Postgres initializes a *new* data directory.
-- For existing volumes, create it manually (see docs/DEVELOPMENT-LOCAL.md or run psql inside container).

SELECT 'CREATE DATABASE brewapp_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'brewapp_test')\gexec

