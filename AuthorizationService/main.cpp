#define CPPHTTPLIB_OPENSSL_SUPPORT
#include <iostream>
#include "libraries/httplib.h"
#include "src/api/OrganizerRegistration/RegistrationOrganizerManager.h"
#include "src/api/UserRegistration/RegistrationUserManager.h"
#include "src/api/Authorization/AuthorizationManager.h"
#include "src/api/Admin/AdminAuthorization.h"
#include "src/api/Admin/AdminCreation.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "src/api/PasswordUpdating.h"

int main() {
    auto logger = spdlog::rotating_logger_mt("file_logger", "../logs/authorizations_service.log", 1048576 * 5, 3);
    logger->flush_on(spdlog::level::info);
    spdlog::set_default_logger(logger);
    spdlog::info("Логгер успешно создан!");

    try {
        httplib::Server server;

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

        std::string connect = "dbname=db_org_registr host=localhost port=5432";
        Database db(connect);
        db.initDbFromFile("../src/postgres/db_org_registr.sql");
        pqxx::connection connection_(connect);
        pqxx::work worker(connection_);

        server.Post("/organizer/register", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            spdlog::info("Получен запрос на регистрацию организатора");
            set_cors_headers(res);
            OrganizerRegistrationManager::RegisterOrganizerRequest(request, res, db);
        });

        server.Post("/user/register", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            spdlog::info("Получен запрос на регистрацию пользователя");
            set_cors_headers(res);
            UserRegistration::RegisterUserRequest(request, res, db);
        });

        server.Post("/authorize", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            spdlog::info("Получен запрос на авторизацию");
            set_cors_headers(res);
            AuthorizationManager::AuthorizationRequest(request, res, db);
        });

        server.Post("/organizer/approve", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            spdlog::info("Получен запрос на подтверждение регистрации организатора");
            set_cors_headers(res);
            OrganizerRegistrationManager::OrganizerRegisterApproval(request, res, db);
        });

        server.Get("/is_working", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            res.status = 200;
        });

        server.Post("/admin/create",  [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            spdlog::info("Получен запрос на создание администратора");
            set_cors_headers(res);
            AdminCreation::CreateAdminRequest(request, res, db);
        });

        server.Post("/admin/authorize",  [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            spdlog::info("Получен запрос на авторизацию администратора");
            set_cors_headers(res);
            AdminAuthorization::AuthorizeAdminRequest(request, res, db);
        });

        server.Put("/user/:id/password/change", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            spdlog::info("Получен запрос на обновление пароля");
            set_cors_headers(res);
            PasswordUpdating::UpdatePasswordRequest(request, res, db);
        });

        server.Get("/password/recover", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            spdlog::info("Получен запрос на восстановление пароля");
            set_cors_headers(res);
//            PasswordUpdating::RecoverPasswordRequest(request, res, db);
        });

        std::cout << "Server is listening on 0.0.0.0:8003\n";
        server.listen("0.0.0.0", 8003);

    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}