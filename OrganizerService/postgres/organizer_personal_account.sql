CREATE SCHEMA Organizers IF NOT EXISTS;

CREATE TABLE Organizers.OrganizersData (
    organizer_id SERIAL PRIMARY KEY,
    organization_name varchar(255),
    tin varchar(30),
    email varchar(255),
    phone_number varchar(20),
    registered timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP
);

-- CREATE TABLE Users.Orders (
--     fan_id integer references UsersData,
--     ticket_id integer, -- ссылка TicketService (доделаю потом)
--     first_team varchar(100),
--     second_team varchar(100),
--     place varchar(100),
--     date timestamp,
--     created_at timestamp default CURRENT_TIMESTAMP,
-- );
