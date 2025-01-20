DROP SCHEMA IF EXISTS Organizers CASCADE;

CREATE SCHEMA IF NOT EXISTS Organizers;

CREATE TABLE Organizers.OrganizersData (
   organizer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   organization_name VARCHAR(255),
   tin VARCHAR(30),
   email VARCHAR(255),
   phone_number VARCHAR(20),
   registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TYPE IF EXISTS MatchStatus CASCADE;

CREATE TYPE MatchStatus AS ENUM ('PENDING', 'IN_PROGRESS', 'FINISHED');

-- TODO: привести в формат timestamp
CREATE TABLE Organizers.Matches (
    match_id SERIAL PRIMARY KEY,
    organizer_id UUID NOT NULL REFERENCES Organizers.OrganizersData(organizer_id),
    team_home VARCHAR(255),
    team_away VARCHAR(255),
    match_datetime TIMESTAMP,
    stadium VARCHAR(255),
    match_description TEXT,
    match_status MatchStatus DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);