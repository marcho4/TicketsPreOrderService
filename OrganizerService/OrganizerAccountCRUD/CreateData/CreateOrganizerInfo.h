#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../../postgres/PostgresProcessing.h"

class CreateOrganizerInfo {
    using json = nlohmann::json;

public:
    void OrganizerPersonalInfoCreateRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);

    bool CheckOrganizerExistence(const std::string& tin, Database& db);

};
