#include <iostream>
#include "../libraries/httplib.h"
#include "src/postgres/PostgresProcessing.h"
#include "src/processRequests.h"

ProcessRequests processing;

int main() {
    try {
        httplib::Server server;
        std::string connect = "dbname=orchestrator host=postgres user=postgres password=postgres port=5432";
        Database db(connect);
        db.initDbFromFile("src/postgres/pending_organizers.sql");
        pqxx::connection connection_(connect);
        pqxx::work worker(connection_);

        server.Get("/pending_requests", [&](const httplib::Request& req, httplib::Response& res) {
            processing.GetOrganizersRequest(req, res, db);
        });

        server.Post("/process_organizer", [&](const httplib::Request& req, httplib::Response& res) {
            processing.ProcessOrganizerRequest(req, res, db);
        });

        server.Post("/add_organizer_request", [&](const httplib::Request& req, httplib::Response& res) {
            processing.AddOrganizerRequest(req, res, db);
        });

        server.Get("/is_working", [&](const httplib::Request& req, httplib::Response& res) {
            res.status = 200;
            res.set_content("Server is working", "text/plain");
        });

        std::cout << "Server is listening http://localhost:8003" << '\n';
        server.listen("0.0.0.0", 8003);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}
