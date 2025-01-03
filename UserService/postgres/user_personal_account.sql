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

CREATE TABLE Users.OrderHistory (
    fan_id integer references UsersData,
    billing_id integer,
    ticket_id integer, -- ссылка TicketService (доделаю потом)
    status varchar(20),
    created_at timestamp default,
    updated_at timestamp default
);