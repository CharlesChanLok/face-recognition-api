-- Create fresh tables

\i '/docker-entrypoint-initdb.d/tables/users.sql'
\i '/docker-entrypoint-initdb.d/tables/logins.sql'

\i '/docker-entrypoint-initdb.d/seed/seed.sql'