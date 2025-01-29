#include <iostream>
#include "../libraries/httplib.h"
#include "src/postgres/PostgresProcessing.h"
#include "src/api/RequestsHandler.h"

int main() {
    try {
        httplib::Server server;
        std::string connect = "dbname=pending_organizers host=localhost port=5432";
        Database db(connect);
        db.initDbFromFile("/Users/nazarzakrevskij/TicketsPreOrderService/AdminService/src/postgres/pending_organizers.sql");
        pqxx::connection connection_(connect);
        pqxx::work worker(connection_);

        server.Get("admin/pending_requests", [&](const httplib::Request& req, httplib::Response& res) {
            GetRequests::GetOrganizersRequestList(req, res, db);
        });

        server.Post("admin/process_organizer", [&](const httplib::Request& req, httplib::Response& res) {
            ProcessRequest::ProcessOrganizerRequest(req, res, db);
        });

        server.Post("admin/add_organizer_request", [&](const httplib::Request& req, httplib::Response& res) {
            AddRequest::AddOrganizerRequest(req, res, db);
        });

        server.Get("/is_working", [&](const httplib::Request& req, httplib::Response& res) {
            res.status = 200;
            res.set_content("Server is working", "text/plain");
        });

        std::cout << "Server is listening http://localhost:8082" << '\n';
        server.listen("localhost", 8082);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}
