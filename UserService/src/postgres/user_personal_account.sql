DROP SCHEMA IF EXISTS Users CASCADE;

CREATE SCHEMA IF NOT EXISTS Users;

CREATE TABLE IF NOT EXISTS Users.UsersData (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(50),
    name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    birthday DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Users.Orders (
    fan_id UUID REFERENCES Users.UsersData(user_id),
    ticket_id INTEGER, -- ссылка на TicketService
    first_team VARCHAR(100),
    second_team VARCHAR(100),
    place VARCHAR(100),
    date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);