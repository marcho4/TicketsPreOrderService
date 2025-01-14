#include <iostream>
#include "../libraries/httplib.h"
#include "postgres/PostgresProcessing.h"

int main() {
    try {
        httplib::Server server;
        std::string connect = "dbname=pending_organizers host=localhost port=5432";
        Database db(connect);
        db.initDbFromFile("/Users/nazarzakrevskij/TicketsPreOrderService/AuthorizationService/postgres/pending_organizers.sql");
        pqxx::connection connection_(connect);
        pqxx::work worker(connection_);

        server.Get("/pending_requests", [&](const httplib::Request& req, httplib::Response& res) {

        });

        server.Post("/process_organizer", [&](const httplib::Request& req, httplib::Response& res) {

        });

        std::cout << "Server is listening http://localhost:8081" << '\n';
        server.listen("localhost", 8081);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}
