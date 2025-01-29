#define CPPHTTPLIB_OPENSSL_SUPPORT
#include <iostream>
#include "libraries/httplib.h"
#include "src/OrganizerAccountCRUD/CreateOrganizerAccount.h"
#include "src/OrganizerAccountCRUD/UpdateOrganizerAccount.h"
#include "src/MatchCreating/CreateMatch/MatchCreator.h"
#include "src/MatchCreating/UpdateMatchInfo/Updator.h"
#include "src/OrganizerAccountCRUD/GetAccountInfo.h"

int main() {
    try {
        httplib::SSLServer server("../../config/ssl/cert.pem", "../../config/ssl/key.pem");
        // инициализация хоста и порта для подключения
        std::string connect = "dbname=organizer_personal_account host=localhost port=5432";
        Database db(connect);
        db.initDbFromFile("src/postgres/organizer_personal_account.sql");
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();
        server.Post("/create_organizer_info", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            CreateOrganizerInfo createOrganizerInfo;
            createOrganizerInfo.OrganizerPersonalInfoCreateRequest(request, res, db);
        });

        server.Put("/update_organizer_info/:id", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            UpdateOrganizerInfo updateOrganizerInfo;
            updateOrganizerInfo.OrganizerPersonalInfoUpdateRequest(request, res, db);
        });

        server.Get("/get_account_info/:id", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            GetAccountInfo::GetAccountInfoRequest(request, res, db);
        });

        server.Post("/organizer/:id/create_match", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            MatchCreator creator;
            creator.CreateMatchRequest(request, res, db);
        });
        // TODO: написать логику
        server.Put("/organizer/:id/update_match/:match_id", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
        });
        // TODO: написать логику
        server.Post("/organizer/:id/delete_match/:match_id", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
        });
        // TODO: написать логику
        server.Post("/organizer/:id/add_tickets/:match_id", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
        });

        std::cout << "Server is listening http://0.0.0.0:8004" << '\n';
        server.listen("0.0.0.0", 8004);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}