#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../postgres/PostgresProcessing.h"

class CreateOrganizerInfo {
    using json = nlohmann::json;

public:
    void OrganizerPersonalInfoCreateRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);

    static bool CheckOrganizerExistence(std::string& organizer_id, Database &db);

    void sendError(httplib::Response& res, int status, const std::string& message);
};
