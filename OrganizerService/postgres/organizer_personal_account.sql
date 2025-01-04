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

enum MatchStatus {
    PENDING,
    IN_PROGRESS,
    FINISHED
}

CREATE TABLE Organizers.Matches (
    match_id SERIAL PRIMARY KEY,
    organizer_id integer not null references Organizers.OrganizersData(organizer_id),
    team_home varchar(255),
    team_away varchar(255),
    match_date timestamp,
    match_time timestamp,
    stadium varchar(255),
    match_description text,
    match_status MatchStatus default 'PENDING',
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
);
