#include <iostream>
#include "../libraries/httplib.h"
//#include <pqxx/pqxx>
#include "OrganizerRegistration/OrganizerRegistrationImpl.h"

int main() {
    try {
        httplib::Server server;

        server.Post("/register_organizer", [](const httplib::Request& request, httplib::Response &res) {
            OrganizerRegistration::HttpRegisterOrganizer(request, res);
        });

//        server.Post("/notifications", [&db](const httplib::Request& request, httplib::Response& res) {
//            HttpNotificationPost(request, res, id, db);

        std::cout << "Server is listening http://localhost:8081" << '\n';
        server.listen("localhost", 8081);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}