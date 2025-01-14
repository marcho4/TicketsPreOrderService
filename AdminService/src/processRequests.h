#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "postgres/PostgresProcessing.h"

class ProcessRequests {
    using json = nlohmann::json;

public:
    void GetOrganizersRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    void ProcessOrganizerRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    void AddOrganizerRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    pqxx::result GetPersonalData(const std::string& request_id, Database& db);
};

