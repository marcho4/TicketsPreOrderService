#include <iostream>
#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include <pqxx/pqxx>
#include "../postgres/PostgresProcessing.h"

class OrganizerRegistrationManager {
    using json = nlohmann::json;

    enum Status {
        AWAITS = 0,
        APPROVED = 1,
        REJECTED = 2,
    };

public:
    static void RegisterOrganizerRequest(const httplib::Request& request, httplib::Response &res, Database& db);

    static void OrganizerRegisterApproval(const httplib::Request& request, httplib::Response &res, Database& db);

    static void RegisterOrganizer(const std::string& email, const std::string& password,
                           const std::string& company, Database& db);

    static bool CheckOrganizerExistence(const std::string& email, Database& db);

    static void NotifyOrganizer(const std::string& email, const std::string& login, const std::string& password);

    static void SetErrorResponse(httplib::Response& res, const std::string& message) {
        res.status = 400;
        res.set_content(json{{"status", "error"}, {"message", message}}.dump(), "application/json");
    }

    static bool checkCorrectnessTIN(const std::string& tin);
};

