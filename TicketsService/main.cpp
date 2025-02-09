#include <iostream>
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "../libraries/httplib.h"
#include "src/postgres/PostgresProcessing.h"
#include "src/api/TicketsCRUD/AddTickets.h"
#include "src/api/TicketsCRUD/GetTickets.h"

int main() {

    auto logger = spdlog::rotating_logger_mt("file_logger", "../logs/organizer_service.log", 1048576 * 5, 3);
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

        std::string connect = "dbname=orchestrator host=org_postgres user=postgres password=postgres port=5432";
        Database db(connect);
        db.initDbFromFile("src/postgres/organizer_personal_account.sql");
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();

        server.Post("/ticket/:match_id/add", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на создание выгрузку билетов");
            AddTickets::AddingTicketsRequest(request, res, db);
        });

        server.Put("/ticket/:match_id/update", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на обновление билетов на матч");

        });

        server.Get("/ticket/:match_id/get", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на получение билетов на матч");
            GetTickets::GetTicketsRequest(request, res, db);
        });

        server.Post("/ticket/:id/reserve", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на бронирование билета");

        });

        server.Put("/ticket/:id/cancel", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на отмену бронирования билета");

        });

        server.Delete("/ticket/:id/delete", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на удаление билета");

        });

        std::cout << "Server is listening http://localhost:8005" << '\n';
        server.listen("0.0.0.0", 8005);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}