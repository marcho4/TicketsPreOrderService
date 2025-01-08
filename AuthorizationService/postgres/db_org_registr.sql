DROP SCHEMA IF EXISTS AuthorizationService CASCADE;

CREATE SCHEMA IF NOT EXISTS AuthorizationService;

DROP TYPE IF EXISTS status CASCADE;

CREATE TYPE Status AS ENUM ('ADMIN', 'ORGANIZER', 'USER');

CREATE SCHEMA IF NOT EXISTS AuthorizationService;

CREATE TABLE IF NOT EXISTS AuthorizationService.AuthorizationData (
  id UUID PRIMARY KEY,
  login VARCHAR(50),
  password VARCHAR(50),
  email VARCHAR(50) UNIQUE,
  status Status
);

-- enum Status {
--      ADMIN = 0,
--      ORGANIZER = 1,
--      USER = 2
-- };