#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "../postgres/PostgresProcessing.h"

class GetAccountInfo {
    using json = nlohmann::json;

public:
    void GetAccountInfoRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static pqxx::result getData(const std::string& id, Database& db);

    bool CheckOrganizerExistence(const std::string& id, Database& db);
};
