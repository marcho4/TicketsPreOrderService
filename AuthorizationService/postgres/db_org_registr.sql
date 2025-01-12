DROP SCHEMA IF EXISTS AuthorizationService CASCADE;

CREATE SCHEMA IF NOT EXISTS AuthorizationService;

DROP TYPE IF EXISTS status CASCADE;

CREATE TYPE Status AS ENUM ('ADMIN', 'ORGANIZER', 'USER');

CREATE SCHEMA IF NOT EXISTS AuthorizationService;

CREATE TABLE IF NOT EXISTS AuthorizationService.AuthorizationData (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login VARCHAR(200),
    password VARCHAR(200),
    email VARCHAR(200),
    status Status
);

CREATE TABLE if NOT EXISTS AuthorizationService.TemplateUser (
    id UUID references AuthorizationService.AuthorizationData(id),
    name VARCHAR(200),
    surname VARCHAR(200),
    email VARCHAR(200)
);
