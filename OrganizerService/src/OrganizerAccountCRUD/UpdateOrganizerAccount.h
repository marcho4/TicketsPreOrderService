#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../postgres/PostgresProcessing.h"

class UpdateOrganizerInfo {
    using json = nlohmann::json;

public:
    void OrganizerPersonalInfoUpdateRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);

    static bool CheckEmailUnique(const std::string& email, const std::string& organizer_id, Database& db);
};
