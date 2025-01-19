#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "../postgres/PostgresProcessing.h"

class GetAccountInfo {
    using json = nlohmann::json;

public:
    static void GetAccountInfoRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static pqxx::result getData(const std::string& id, Database& db);

    static bool CheckOrganizerExistence(const std::string& id, Database& db);
};
