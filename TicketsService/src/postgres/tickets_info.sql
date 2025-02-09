DROP SCHEMA IF EXISTS Tickets CASCADE;
DROP TYPE IF EXISTS Status;
DROP TYPE IF EXISTS Sector;

CREATE SCHEMA Tickets;

CREATE TYPE Status AS ENUM ('sold', 'reserved', 'available');

CREATE TYPE Sector AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J');

CREATE TABLE Tickets.TicketsData (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     match_id UUID NOT NULL,
     user_id UUID,
     price INT NOT NULL CHECK (price > 0),
     sector Sector NOT NULL,
     row INT NOT NULL CHECK (row > 0),
     seat INT NOT NULL CHECK (seat > 0),
     status Status NOT NULL DEFAULT 'available',
     CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     UNIQUE (match_id, sector, row, seat)
);