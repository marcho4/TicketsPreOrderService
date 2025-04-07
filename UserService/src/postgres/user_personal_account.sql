CREATE SCHEMA IF NOT EXISTS Users;


CREATE TABLE IF NOT EXISTS Users.UsersData (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(50),
    name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    birthday VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Users.AttendedEvents (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES Users.UsersData(user_id),
    match_id UUID NOT NULL,
    ticket_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Users.Preorders (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    match_id UUID NOT NULL,
    ticket_id UUID NOT NULL,
    match_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------triggers-----------------------------------------------------------

-- Триггер для автоматического переноса предзаказов в посещенные события
CREATE OR REPLACE FUNCTION add_preorder_to_attended_events()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.match_date <= NOW() THEN
        INSERT INTO Users.AttendedEvents (user_id, match_id, ticket_id)
        VALUES (NEW.user_id, NEW.match_id, NEW.ticket_id);
        DELETE FROM Users.Preorders WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Триггер будет срабатывать при вставке или обновлении записей в Preorders
CREATE TRIGGER auto_move_to_attended
    AFTER INSERT OR UPDATE ON Users.Preorders
    FOR EACH ROW
    EXECUTE FUNCTION add_preorder_to_attended_events();