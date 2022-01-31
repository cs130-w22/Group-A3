--
-- 1-init
--
-- Initialize our extensions, timezone, etc.
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET timezone = 'America/Los_Angeles';
