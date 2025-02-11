DROP SCHEMA IF EXISTS Users CASCADE;

CREATE SCHEMA IF NOT EXISTS Users;


CREATE TABLE IF NOT EXISTS Users.UsersData (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(50),
    name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    birthday varchar(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Users.AttendedEvents (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES Users.UsersData(user_id),
    match_id UUID NOT NULL,
    ticket_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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