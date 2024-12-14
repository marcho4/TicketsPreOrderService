CREATE SCHEMA IF NOT EXISTS AuthorizationService;

CREATE TABLE IF NOT EXISTS AuthorizationService.AuthorizationData (
     id UUID PRIMARY KEY,
     login varchar(50),
     password varchar(50),
     status integer
);

enum Status {
     ADMIN = 0,
     ORGANIZER = 1,
     USER = 2
};