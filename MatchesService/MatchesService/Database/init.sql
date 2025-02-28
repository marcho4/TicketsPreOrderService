CREATE EXTENSION IF NOT EXISTS plpgsql;

DROP TYPE IF EXISTS matchstatus CASCADE;

CREATE TYPE matchstatus AS ENUM ('pending', 'in_progress', 'finished');



CREATE TABLE Matches (
    match_id UUID PRIMARY KEY,
    organizer_id UUID NOT NULL,
    team_home VARCHAR(255),
    team_away VARCHAR(255),
    match_datetime TIMESTAMPTZ,
    stadium VARCHAR(255),
    match_description TEXT,
    match_status matchstatus DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------triggers-----------------------------------------------------------

------------------------------------------------triggers-----------------------------------------------------------

-- создадим триггер для автоматического изменения статуса во время начала матча
CREATE OR REPLACE FUNCTION set_match_to_in_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.match_datetime <= CURRENT_TIMESTAMP AND NEW.match_status = 'pending' THEN
        NEW.match_status = 'in_progress';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- создадим триггер для автоматического изменения статуса после окончания матча
CREATE OR REPLACE FUNCTION update_match_status_to_finished()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.match_datetime < CURRENT_TIMESTAMP AND NEW.match_status = 'in_progress' THEN
        NEW.match_status = 'finished';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER auto_set_to_in_progress
BEFORE UPDATE ON Matches
FOR EACH ROW
EXECUTE FUNCTION set_match_to_in_progress();

CREATE TRIGGER auto_set_to_finished
BEFORE UPDATE ON Matches
FOR EACH ROW
EXECUTE FUNCTION update_match_status_to_finished();

-------------------------------------------------Indices-------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_hash_organizer_id ON Matches USING hash (organizer_id);
CREATE INDEX IF NOT EXISTS idx_hash_match_id ON Matches USING hash (match_id);