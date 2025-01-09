#include <iostream>
#include "../libraries/httplib.h"
#include "OrganizerRegistration/RegistrationOrganizerManager.h"
#include "UserRegistration/RegistrationUserManager.h"
#include "Authorization/AuthorizationManager.h"

int main() {
    try {
        httplib::Server server;
//        // инициализация хоста и порта для подключения
        std::string connect = "dbname=db_org_registr host=localhost port=5432";
        Database db(connect);
        db.initDbFromFile("/Users/nazarzakrevskij/TicketsPreOrderService/AuthorizationService/postgres/db_org_registr.sql");
        pqxx::connection connection_(connect);
        pqxx::work worker(connection_);
        std::string query = "INSERT INTO AuthorizationService.AuthorizationData (login, password, email) "
                            "VALUES ($1, $2, $3)";
        db.executeQueryWithParams(query, "pidor", "pidor1", "pidor12");
        pqxx::result R = worker.exec("SELECT * FROM AuthorizationService.AuthorizationData");
        if (R.empty()) {
            std::cout << "Empty" << std::endl;
        } else {
            std::cout << "Not empty" << std::endl;
        }
        worker.commit();
//        worker.commit();
        server.Post("/register_organizer", [&db](const httplib::Request& request, httplib::Response &res) {
            OrganizerRegistrationManager::RegisterOrganizerRequest(request, res, db);
        });

        server.Post("/register_user", [&db](const httplib::Request& request, httplib::Response &res) {
            UserRegistration::RegisterUserRequest(request, res, db);
        });

        server.Post("/authorize/:id", [&db](const httplib::Request& request, httplib::Response &res) {
            AuthorizationManager::AuthorizationRequest(request, res, db);
        });

        server.Post("/authorize_approved", [&db](const httplib::Request& request, httplib::Response &res) {
            OrganizerRegistrationManager::OrganizerRegisterApproval(request, res, db);
        });

        server.Get("/is_working", [&db](const httplib::Request& request, httplib::Response &res) {
            res.status = 200;
        });
        std::cout << "Server is listening http://localhost:8081" << '\n';
        server.listen("localhost", 8081);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}
