#include <iostream>
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "../libraries/httplib.h"
#include "src/postgres/PostgresProcessing.h"

int main() {

    auto logger = spdlog::rotating_logger_mt("file_logger", "../logs/tickets_service.log", 1048576 * 5, 3);
    logger->flush_on(spdlog::level::info);
    spdlog::set_default_logger(logger);
    spdlog::info("Логгер успешно создан!");

    try {
        httplib::Server server;

        server.Options(".*", [&](const httplib::Request& req, httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "http://localhost:8002");
            res.set_header("Access-Control-Allow-Credentials", "true");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.set_header("Content-Type", "application/json");
            res.status = 200;
        });

        auto set_cors_headers = [&](httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "http://localhost:8002");
            res.set_header("Access-Control-Allow-Credentials", "true");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.set_header("Content-Type", "application/json");
        };

//        std::string connect = "dbname=orchestrator host=org_postgres user=postgres password=postgres port=5432";
        std::string connect = "dbname=payment host=localhost port=5432";
        Database db(connect);
        db.initDbFromFile("../src/postgres/payment.sql");
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();

        server.Post("/payments/create", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);

        });

        server.Post("/payments/webhook", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);

        });

        server.Get("/payments/:id/status", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);

        });

        server.Post("/payment/:id/refund", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);

        });

        std::cout << "Server is listening http://localhost:8008" << '\n';
        server.listen("0.0.0.0", 8008);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}
