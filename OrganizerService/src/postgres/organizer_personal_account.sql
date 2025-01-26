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

--------------------------------------------------------------------------------------------------------

-- создадим триггер для автоматического изменения статуса во время начала матча
CREATE OR REPLACE FUNCTION set_match_to_in_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.match_datetime <= CURRENT_TIMESTAMP AND NEW.match_status = 'PENDING' THEN
        NEW.match_status = 'IN_PROGRESS';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- создадим триггер для автоматического изменения статуса после окончания матча
CREATE OR REPLACE FUNCTION update_match_status_to_finished()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.match_datetime < CURRENT_TIMESTAMP AND NEW.match_status = 'IN_PROGRESS' THEN
        NEW.match_status = 'FINISHED';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER auto_set_to_in_progress
BEFORE UPDATE ON Organizers.Matches
FOR EACH ROW
EXECUTE FUNCTION set_match_to_in_progress();

CREATE TRIGGER auto_set_to_finished
BEFORE UPDATE ON Organizers.Matches
FOR EACH ROW
EXECUTE FUNCTION update_match_status_to_finished();

--------------------------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_hash_organizer_id ON Organizers.Matches USING hash (organizer_id);
CREATE INDEX IF NOT EXISTS idx_hash_match_id ON Organizers.Matches USING hash (match_id);
CREATE INDEX IF NOT EXISTS idx_hash_email ON Organizers.OrganizersData USING hash (email);