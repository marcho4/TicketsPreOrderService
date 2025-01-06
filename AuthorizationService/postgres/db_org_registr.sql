CREATE SCHEMA IF NOT EXISTS AuthorizationService;

CREATE TABLE IF NOT EXISTS AuthorizationService.AuthorizationData (
     id UUID PRIMARY KEY,
     login varchar(50),
     password varchar(50),
     email varchar(50) UNIQUE,
     status integer
);

enum Status {
     ADMIN = 0,
     ORGANIZER = 1,
     USER = 2
};