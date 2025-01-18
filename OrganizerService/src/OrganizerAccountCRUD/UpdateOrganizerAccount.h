#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../postgres/PostgresProcessing.h"

class UpdateOrganizerInfo {
    using json = nlohmann::json;

public:
    void OrganizerPersonalInfoUpdateRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);
};
