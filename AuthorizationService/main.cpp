#include <iostream>
#include "libraries/httplib.h"
#include "src/OrganizerRegistration/RegistrationOrganizerManager.h"
#include "src/UserRegistration/RegistrationUserManager.h"
#include "src/Authorization/AuthorizationManager.h"
#include <fstream>

std::string getEnvData(const std::string& filepath, const std::string& data) {
    std::ifstream file(filepath);
    if (!file.is_open()) {
        throw std::runtime_error("Файл не найден\n");
    }
    std::string line;
    while (std::getline(file, line)) {
        if (line.find(data) != std::string::npos) {
            return line.substr(line.find("=") + 1);
        }
    }
    return "";
}

int main() {
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

        std::string connect = getEnvData("config.ini", "DB_CONNECT");
        Database db(connect);
        std::string data = getEnvData("config.ini", "DB_INIT_PATH");
        db.initDbFromFile(data);
        pqxx::connection connection_(connect);
        pqxx::work worker(connection_);

        server.Post("/register_organizer", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            OrganizerRegistrationManager::RegisterOrganizerRequest(request, res, db);
        });

        server.Post("/register_user", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            UserRegistration::RegisterUserRequest(request, res, db);
        });

        server.Post("/authorize", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            AuthorizationManager::AuthorizationRequest(request, res, db);
        });

        server.Post("/authorize_approved", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            OrganizerRegistrationManager::OrganizerRegisterApproval(request, res, db);
        });

        server.Get("/is_working", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            res.status = 200;
        });

        std::cout << "Server is listening on localhost:8081\n";
        server.listen("localhost", 8081);

    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}