#include <iostream>
#include "../libraries/httplib.h"
#include "OrganizerRegistration/OrganizerRegistrationImpl.h"
#include "UserRegistration/UserRegistrationImpl.h"
#include "Authorization/OrganizerAuthorizationImpl.h"

int main() {
    try {
        httplib::Server server;
        // инициализация хоста и порта для подключения
        std::string connect = "dbname=db_org_registr host=localhost port=5432";
        Database db(connect);
        db.initDbFromFile("/Users/nazarzakrevskij/TicketsPreOrderService/AuthorizationService/postgres/db_org_registr.sql");
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();

        server.Post("/register_organizer", [&db](const httplib::Request& request, httplib::Response &res) {
            OrganizerRegistration::RegisterOrganizerRequest(request, res, db);
        });

        server.Post("/register_user", [&db](const httplib::Request& request, httplib::Response &res) {
            UserRegistration::RegisterUserRequest(request, res, db);
        });

        server.Post("/authorize", [&db](const httplib::Request& request, httplib::Response &res) {
            AuthorizationImpl::AuthorizationRequest(request, res, db);
        });

        std::cout << "Server is listening http://localhost:8081" << '\n';
        server.listen("localhost", 8081);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}