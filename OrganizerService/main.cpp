#include <iostream>
#include "../libraries/httplib.h"
#include "src/OrganizerAccountCRUD/CreateOrganizerAccount.h"
#include "src/OrganizerAccountCRUD/UpdateOrganizerAccount.h"
#include "src/MatchCreating/CreateMatch/MatchCreator.h"
#include "src/MatchCreating/UpdateMatchInfo/Updator.h"
#include "src/OrganizerAccountCRUD/GetAccountInfo.h"

int main() {
    try {
        httplib::Server server;
        // инициализация хоста и порта для подключения
        std::string connect = "dbname=organizer_personal_account host=localhost port=5432";
        Database db(connect);
        db.initDbFromFile("src/postgres/db_org_registr.sql");
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();
        server.Post("/create_organizer_info/:id", [&db](const httplib::Request& request, httplib::Response &res) {
            CreateOrganizerInfo createOrganizerInfo;
            createOrganizerInfo.OrganizerPersonalInfoCreateRequest(request, res, db);
        });

        server.Put("/update_organizer_info/:id", [&db](const httplib::Request& request, httplib::Response &res) {
            UpdateOrganizerInfo updateOrganizerInfo;
            updateOrganizerInfo.OrganizerPersonalInfoUpdateRequest(request, res, db);
        });

        server.Get("/get_account_info/:id", [&db](const httplib::Request& request, httplib::Response &res) {
            GetAccountInfo::GetAccountInfoRequest(request, res, db);
        });

        server.Post("/organizer/:id/create_match", [&db](const httplib::Request& request, httplib::Response &res) {
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

        std::cout << "Server is listening http://localhost:3000" << '\n';
        server.listen("localhost", 3000);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}