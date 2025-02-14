#define CPPHTTPLIB_OPENSSL_SUPPORT
#include <iostream>
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "../libraries/httplib.h"
#include "src/OrganizerAccountCRUD/CreateOrganizerAccount.h"
#include "src/OrganizerAccountCRUD/UpdateOrganizerAccount.h"
#include "src/MatchCreating/CreateMatch/MatchCreator.h"
#include "src/MatchCreating/UpdateMatchInfo/Updator.h"
#include "src/OrganizerAccountCRUD/GetAccountInfo.h"

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

        server.Post("/organizer/:id/create_match", [&db](const httplib::Request& request, httplib::Response &res) {
            spdlog::info("Получен запрос на создание матча");
            MatchCreator creator;
            creator.CreateMatchRequest(request, res, db);
        });
        // TODO: написать логику
        server.Put("/organizer/:id/update_match/:match_id", [&db](const httplib::Request& request, httplib::Response &res) {

        });
        // TODO: написать логику
        server.Post("/organizer/:id/delete_match/:match_id", [&db](const httplib::Request& request, httplib::Response &res) {

        });
        // TODO: написать логику
        server.Post("/organizer/:id/add_tickets/:match_id", [&db](const httplib::Request& request, httplib::Response &res) {

        });

        std::cout << "Server is listening http://localhost:8004" << '\n';
        server.listen("0.0.0.0", 8004);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}