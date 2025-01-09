DROP SCHEMA IF EXISTS AuthorizationService CASCADE;

CREATE SCHEMA IF NOT EXISTS AuthorizationService;

DROP TYPE IF EXISTS status CASCADE;

CREATE TYPE Status AS ENUM ('ADMIN', 'ORGANIZER', 'USER');

CREATE SCHEMA IF NOT EXISTS AuthorizationService;

CREATE TABLE IF NOT EXISTS AuthorizationService.AuthorizationData (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login VARCHAR(200),
  password VARCHAR(200),
  email VARCHAR(200) UNIQUE
);

-- VALUES ('bebra', 'pukish', 'nazik@dvv');
-- enum Status {
--      ADMIN = 0,
--      ORGANIZER = 1,
--      USER = 2
-- };