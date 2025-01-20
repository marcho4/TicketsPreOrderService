#include <iostream>
#include "../libraries/httplib.h"
#include "OrganizerAccountCRUD/CreateData/CreateOrganizerInfo.h"
#include "OrganizerAccountCRUD/UpdateData/UpdateOrganizerInfo.h"
#include "MatchCreating/CreateMatch/Creator.h"
#include "MatchCreating/UpdateMatchInfo/Updator.h"


int main() {
    try {
        httplib::Server server;
        // инициализация хоста и порта для подключения
        std::string connect = "dbname=organizer_personal_account.sql host=localhost port=5432";
        Database db(connect);
        db.initDbFromFile("/Users/nazarzakrevskij/TicketsPreOrderService/UserService/postgres/organizer_personal_account.sql");
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();

        server.Post("/create_organizer_info/{id}", [&db](const httplib::Request& request, httplib::Response &res) {
            CreateOrganizerInfo createOrganizerInfo;
            createOrganizerInfo.OrganizerPersonalInfoCreateRequest(request, res, db);
        });

        server.Post("/update_organizer_info/{id}", [&db](const httplib::Request& request, httplib::Response &res) {
            UpdateOrganizerInfo updateOrganizerInfo;
            updateOrganizerInfo.OrganizerPersonalInfoUpdateRequest(request, res, db);
        });

        server.Post("/organizer/{id}/create_match", [&db](const httplib::Request& request, httplib::Response &res) {
            Creator createMatch;
            createMatch.CreateMatchRequest(request, res, db);
        });

        server.Post("/organizer/{id}/update_match/{match_id}", [&db](const httplib::Request& request, httplib::Response &res) {
            Updator updateMatch;
            updateMatch.UpdateMatchRequest(request, res, db);
        });

        server.Post("/organizer/{id}/delete_match/{match_id}", [&db](const httplib::Request& request, httplib::Response &res) {
            Updator updateMatch; // надо заменить по готовности
            updateMatch.UpdateMatchRequest(request, res, db);
        });

        server.Post("/organizer/{id}/add_tickets/{match_id}", [&db](const httplib::Request& request, httplib::Response &res) {
            Updator updateMatch; // надо заменить по готовности
            updateMatch.UpdateMatchRequest(request, res, db);
        });

        std::cout << "Server is listening http://localhost:8081" << '\n';
        server.listen("localhost", 8081);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}