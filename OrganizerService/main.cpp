#define CPPHTTPLIB_OPENSSL_SUPPORT
#include <iostream>
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "third_party/httplib.h"
#include "src/organizer_crud/CreateOrganizerAccount.h"
#include "src/organizer_crud/UpdateOrganizerAccount.h"
#include "src/organizer_crud/GetAccountInfo.h"
#include "config/config.h"

int main() {

    auto logger = spdlog::rotating_logger_mt("file_logger", "../logs/organizer_service.log", 1048576 * 5, 3);
    logger->flush_on(spdlog::level::info);
    spdlog::set_default_logger(logger);
    spdlog::info("Логгер успешно создан!");

    Config cfg = Config::MustLoadConfig("../config/config.yaml");

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

        std::string connect = "dbname=" + cfg.database_.db_name +
                              " host=" + cfg.database_.host +
                              " port=" + std::to_string(cfg.database_.port) +
                              " user=" + cfg.database_.user +
                              " password=" + cfg.database_.password;
        Database db(connect);
        db.initDbFromFile(cfg.database_.init_db_path);
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();

        server.Post("/organizer/create_account", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на создание аккаунта организатора");
            CreateOrganizerInfo::OrganizerPersonalInfoCreateRequest(request, res, db);
        });

        server.Put("/organizer/update_info/:id", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на обновление данных организатора");
            UpdateOrganizerInfo updateOrganizerInfo;
            updateOrganizerInfo.OrganizerPersonalInfoUpdateRequest(request, res, db);
        });

        server.Get("/organizer/get_account_info/:id", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            spdlog::info("Получен запрос на получение данных организатора");
            GetAccountInfo::GetAccountInfoRequest(request, res, db);
        });

        std::cout << "Server is listening http://localhost:8004" << '\n';
        server.listen(cfg.server_.host, cfg.server_.port);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}