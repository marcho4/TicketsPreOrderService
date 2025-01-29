#include <iostream>
#include "../libraries/httplib.h"
#include "src/postgres/PostgresProcessing.h"
#include "src/api/RequestsHandler.h"

int main() {
    try {
        httplib::Server server;
        // Обработчик preflight OPTIONS запросов
        server.Options(".*", [&](const httplib::Request& req, httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "http://localhost:3000");
            res.set_header("Access-Control-Allow-Credentials", "true");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.set_header("Content-Type", "application/json");
            res.status = 200;
        });

        // Функция для установки CORS-заголовков
        auto set_cors_headers = [&](httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "http://localhost:3000");
            res.set_header("Access-Control-Allow-Credentials", "true");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.set_header("Content-Type", "application/json");
        };
        std::string connect = "dbname=orchestrator host=admin_postgres user=postgres password=postgres port=5432";
        Database db(connect);
        db.initDbFromFile("src/postgres/pending_organizers.sql");
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

        server.Get("/is_working", [&db, &set_cors_headers](const httplib::Request& req, httplib::Response& res) {
            set_cors_headers(res);
            res.status = 200;
            res.set_content("Server is working", "text/plain");
        });

        std::cout << "Server is listening http://localhost:8003" << '\n';
        server.listen("0.0.0.0", 8003);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}
