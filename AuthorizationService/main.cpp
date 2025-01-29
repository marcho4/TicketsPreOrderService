#include <iostream>
#include "libraries/httplib.h"
#include "src/OrganizerRegistration/RegistrationOrganizerManager.h"
#include "src/UserRegistration/RegistrationUserManager.h"
#include "src/Authorization/AuthorizationManager.h"
#include "src/Admin/AdminAuthorization.h"
#include "src/Admin/AdminCreation.h"
#include "src/UserRegistration/RegistrationUserManager.h"

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

        // Подключение к базе данных
        std::string connect = "dbname=orchestrator host=auth_postgres user=postgres password=postgres port=5432";
        Database db(connect);
        db.initDbFromFile("src/postgres/db_org_registr.sql");
        pqxx::connection connection_(connect);
        pqxx::work worker(connection_);

        // Маршрут для регистрации организатора
        server.Post("/organizer/register", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            OrganizerRegistrationManager::RegisterOrganizerRequest(request, res, db);
        });

        // Маршрут для регистрации пользователя
        server.Post("/user/register", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            UserRegistration::RegisterUserRequest(request, res, db);
        });

        // Маршрут для авторизации
        server.Post("/authorize", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            AuthorizationManager::AuthorizationRequest(request, res, db);
        });

        // Маршрут для подтверждения авторизации организатора
        server.Post("/organizer/approve", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            OrganizerRegistrationManager::OrganizerRegisterApproval(request, res, db);
        });

        // Маршрут для проверки работы сервера
        server.Get("/is_working", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            res.status = 200;
        });

        server.Post("/admin/create",  [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            AdminCreation::CreateAdminRequest(request, res, db);
        });

        server.Post("/admin/authorize",  [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            AdminAuthorization::AuthorizeAdminRequest(request, res, db);
        });

        // admin/create {"api_key": "const", "login" : "some_login", "password": "huy"}
        std::cout << "Server is listening on 0.0.0.0:8002\n";
        server.listen("0.0.0.0", 8002);

    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}