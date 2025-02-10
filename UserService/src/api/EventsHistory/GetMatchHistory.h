#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "../../postgres/PostgresProcessing.h"
#include "../../ErrorHandler.h"

class MatchHistory {
    using json = nlohmann::json;

    static json SerializeResponse(const pqxx::result& response, httplib::Response& res);

public:
    static void GetMatchHistoryRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static pqxx::result GetMatchHistory(const std::string& user_id, Database& db);
};


