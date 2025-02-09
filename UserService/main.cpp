#define CPPHTTPLIB_OPENSSL_SUPPORT
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include <iostream>
#include "libraries/httplib.h"
#include "src/postgres/PostgresProcessing.h"
#include "src/api/UserAccountCRUD/CreateAccount.h"
#include "src/api/UserAccountCRUD/UpdateAccount.h"
#include "src/api/UserAccountCRUD/GetAccountData.h"

int main() {

    auto logger = spdlog::rotating_logger_mt("file_logger", "../logs/user_service.log", 1048576 * 5, 3);
    logger->flush_on(spdlog::level::info);
    spdlog::set_default_logger(logger);
    spdlog::info("Логгер успешно создан!");

    try {
        httplib::Server server;

        server.Options(".*", [&](const httplib::Request& req, httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "http://localhost:3000");
            res.set_header("Access-Control-Allow-Credentials", "true");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.set_header("Content-Type", "application/json");
            res.status = 200;
        });

        auto set_cors_headers = [&](httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "http://localhost:3000");
            res.set_header("Access-Control-Allow-Credentials", "true");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.set_header("Content-Type", "application/json");
        };

        std::string connect = "dbname=user_personal_account host=user_postgres port=5432 user=postgres password=postgres";
        Database db(connect);
        db.initDbFromFile("src/postgres/user_personal_account.sql");
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();

        server.Post("/user/create_account", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на создание аккаунта пользователя");
            AccountCreator::CreateUserAccountRequest(request, res, db);
        });

        server.Put("/user/:id/update_account", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на обновление аккаунта пользователя:");
            AccountUpdator::UpdateUserAccountRequest(request, res, db);
        });

        server.Get("/user/:id/get_account_info", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на получение данных пользователя:");
            DataProvider::GetUserAccountDataRequest(request, res, db);
        });

        server.Get("/user/:id/get_match_history", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);

        });

        server.Delete("/user/:id/delete_account", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);

        });

        std::cout << "Server is listening https://localhost:8001" << '\n';
        server.listen("0.0.0.0", 8001);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}