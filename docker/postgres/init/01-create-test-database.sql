-- Runs once, on first initialization of the postgres-data volume.
--
-- Integration tests truncate tables between runs (docs/.../US-000/validation.md
-- asks for a clean database), which must never happen to the database a
-- developer is running `pnpm dev` against. Separate database, same server.
CREATE DATABASE applyflow_test;
