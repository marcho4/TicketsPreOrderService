#include <iostream>
#include "../libraries/httplib.h"
#include "OrganizerRegistration/OrganizerRegistrationImpl.h"
#include "UserRegistration/UserRegistrationImpl.h"

int main() {
    try {
        httplib::Server server;

        // нужно будет не забыть как параметр передать базу данных по ссылке в скобки
        server.Post("/register_organizer", [](const httplib::Request& request, httplib::Response &res) {
            OrganizerRegistration::RegisterOrganizerRequest(request, res);
        });

        server.Post("/register_user", [](const httplib::Request& request, httplib::Response &res) {
            UserRegistration::RegisterUserRequest(request, res);
        });

//        server.Post("/notifications", [&db](const httplib::Request& request, httplib::Response& res) {
//            HttpNotificationPost(request, res, id, db);

        std::cout << "Server is listening http://localhost:8081" << '\n';
        server.listen("localhost", 8081);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}