#define CPPHTTPLIB_OPENSSL_SUPPORT
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include <iostream>
#include "third_party/httplib.h"
#include "src/database/Database.h"
#include "src/api/user/CreateAccount.h"
#include "src/api/user/UpdateAccount.h"
#include "src/api/user/GetAccountData.h"
#include "src/api/events/GetMatchHistory.h"
#include "src/api/preorders/Preorder.h"
#include "src/api/preorders/PreorderCancel.h"
#include "src/api/preorders/GetPreorders.h"
#include "src/redis/RedisWaitingList.h"

int main() {

    auto logger = spdlog::rotating_logger_mt("file_logger", "../logs/user_service.log", 1048576 * 5, 3);
    logger->flush_on(spdlog::level::info);
    spdlog::set_default_logger(logger);
    spdlog::info("Логгер успешно создан!");

    try {
        httplib::Server server;

        // TODO: Передавать в конструктор RedisWaitingList адрес и порт
        RedisWaitingList redis("localhost", 6379);

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

        std::string connect = "dbname=user_personal_account host=localhost port=5432";
        Database db(connect);
        db.initDbFromFile("../src/database/user_personal_account.sql");
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

        server.Get("/user/:id/events_history", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            MatchHistory::GetMatchHistoryRequest(request, res, db);
        });

        server.Post("/user/:id/add_preorder", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            Preorder::AddPreorderRequest(request, res, db);
        });

        server.Delete("/user/:id/cancel_preorder", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            PreorderCancellation::CancelPreorderRequest(request, res, db);
        });

        server.Get("/user/:id/get_preorders", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            Preorders::GetPreordersRequest(request, res, db);
        });

        server.Delete("/user/:id/delete_account", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);

        });

        server.Post("/redis/user/:id/waiting_list", [&db, &set_cors_headers, &redis](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            redis.AddToWaitingListRequest(request, res, db);
        });

        server.Post("/redis/next_user", [&db, &set_cors_headers, &redis](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            redis.ProcessNextUserRequest(request, res, db);
        });

        std::cout << "Server is listening https://localhost:8007" << '\n';
        server.listen("0.0.0.0", 8007);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}