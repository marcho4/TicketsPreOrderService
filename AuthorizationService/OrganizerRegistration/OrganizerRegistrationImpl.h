#include <iostream>
#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include <pqxx/pqxx>
#include "../postgres/PostgresProcessing.h"

class OrganizerRegistration {
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
};

