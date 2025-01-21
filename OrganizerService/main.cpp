#include <iostream>
#include "libraries/httplib.h"
#include "src/OrganizerAccountCRUD/CreateOrganizerAccount.h"
#include "src/OrganizerAccountCRUD/UpdateOrganizerAccount.h"
#include "src/MatchCreating/CreateMatch/MatchCreator.h"
#include "src/MatchCreating/UpdateMatchInfo/Updator.h"
#include "src/OrganizerAccountCRUD/GetAccountInfo.h"

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
        // инициализация хоста и порта для подключения
        std::string connect = "dbname=orchestrator host=postgres user=postgres password=postgres port=5432";
        Database db(connect);
        db.initDbFromFile("src/postgres/organizer_personal_account.sql");
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();
        server.Post("/create_organizer_info/:id", [&db](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            CreateOrganizerInfo createOrganizerInfo;
            createOrganizerInfo.OrganizerPersonalInfoCreateRequest(request, res, db);
        });

        server.Put("/update_organizer_info/:id", [&db](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            UpdateOrganizerInfo updateOrganizerInfo;
            updateOrganizerInfo.OrganizerPersonalInfoUpdateRequest(request, res, db);
        });

        server.Get("/get_account_info/:id", [&db](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            GetAccountInfo::GetAccountInfoRequest(request, res, db);
        });

        server.Post("/organizer/:id/create_match", [&db](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            MatchCreator creator;
            creator.CreateMatchRequest(request, res, db);
        });
        // TODO: написать логику
        server.Put("/organizer/:id/update_match/:match_id", [&db](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
        });
        // TODO: написать логику
        server.Post("/organizer/:id/delete_match/:match_id", [&db](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
        });
        // TODO: написать логику
        server.Post("/organizer/:id/add_tickets/:match_id", [&db](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
        });

        std::cout << "Server is listening http://0.0.0.0:8004" << '\n';
        server.listen("0.0.0.0", 8004);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}