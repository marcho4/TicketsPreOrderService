#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../../postgres/PostgresProcessing.h"

class Creator {
    using json = nlohmann::json;

public:
    void CreateMatchRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);

    bool Creator::CheckMatchExistence(const std::string& team_home, const std::string& team_away, const std::string& match_date, Database& db);
};


