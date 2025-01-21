CREATE SCHEMA Users IF NOT EXISTS;

CREATE TABLE Users.UsersData (
    user_id SERIAL PRIMARY KEY,
    email varchar(255),
    name varchar(100),
    phone varchar(20),
    birthday date,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP
);

CREATE TABLE Users.Orders (
    fan_id integer references UsersData,
    ticket_id integer, -- ссылка TicketService (доделаю потом)
    first_team varchar(100),
    second_team varchar(100),
    place varchar(100),
    date timestamp,
    created_at timestamp default CURRENT_TIMESTAMP,
);
