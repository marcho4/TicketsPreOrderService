CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- DROP SCHEMA IF EXISTS Organizers CASCADE;

CREATE SCHEMA IF NOT EXISTS Organizers;

CREATE TABLE IF NOT EXISTS Organizers.OrganizerRequests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    tin TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);
