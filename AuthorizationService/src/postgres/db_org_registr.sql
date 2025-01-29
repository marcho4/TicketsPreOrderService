DROP SCHEMA IF EXISTS AuthorizationService CASCADE;

CREATE SCHEMA IF NOT EXISTS AuthorizationService;

DROP TYPE IF EXISTS status CASCADE;

CREATE TYPE Status AS ENUM ('ADMIN', 'ORGANIZER', 'USER');

CREATE SCHEMA IF NOT EXISTS AuthorizationService;

CREATE TABLE IF NOT EXISTS AuthorizationService.AuthorizationData (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login TEXT,
    password TEXT,
    email TEXT,
    user_id TEXT,
    status Status
);

CREATE TABLE if NOT EXISTS AuthorizationService.TemplateUser (
    id UUID references AuthorizationService.AuthorizationData(id),
    name TEXT,
    surname TEXT,
    email TEXT
);


CREATE INDEX IF NOT EXISTS idx_hash_login ON AuthorizationService.AuthorizationData USING hash(login);
CREATE INDEX IF NOT EXISTS idx_hash_user_id ON AuthorizationService.AuthorizationData USING hash(login);