#include <iostream>
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "third_party/httplib.h"
#include "src/database/Database.h"
#include "src/api/tickets_crud/AddTickets.h"
#include "src/api/tickets_crud/GetTickets.h"
#include "src/api/tickets_status/CancelReservation.h"
#include "src/api/tickets_status/TicketsReservation.h"
#include "src/api/tickets_crud/DeleteTickets.h"
#include "src/api/user/GetUsersTickets.h"
#include "src/api/tickets_crud/GetTicket.h"
#include "src/api/tickets_status/CancelPayment.h"
#include "src/api/tickets_status/TicketsPaid.h"

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

        std::string connect = "dbname=tickets host=tickets_postgres user=postgres password=postgres port=5432";
        Database db(connect);
        db.initDbFromFile("src/database/tickets_info.sql");
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();

        server.Post("/ticket/:match_id/add", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на создание выгрузку билетов");
            AddTickets::AddingTicketsRequest(request, res, db);
        });

        server.Get("/ticket/:ticket_id", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на получение информации о билете");
            GetTicket::GetTicketByIdRequest(request, res, db);
        });

        server.Get("/ticket/:match_id/get", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на получение билетов на матч");
            GetTickets::GetTicketsRequest(request, res, db);
        });

        server.Put("/ticket/:id/reserve", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на бронирование билета");
            TicketsReservation::ReserveTicketsRequest(request, res, db);
        });

        server.Put("/ticket/:id/cancel", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на отмену бронирования билета");
            CancelReservation::CancelReservationRequest(request, res, db);
        });

        server.Delete("/ticket/:match_id/delete", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на удаление билета");
            DeleteTickets::DeleteTicketsRequest(request, res, db);
        });

        server.Get("/user/:id/tickets", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на получение билетов пользователя");
            GetUserTickets::GetUserTicketsRequest(request, res, db);
        });

        server.Put("/ticket/:id/pay", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на покупку билета");
            TicketsPaid::PayTicketsRequest(request, res, db);
        });

        server.Put("/ticket/:id/refund", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на возврат средств за билет");
            CancelPayment::CancelPaymentRequest(request, res, db);
        });

        std::cout << "Server is listening http://localhost:8006" << '\n';
        server.listen("0.0.0.0", 8006);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}
