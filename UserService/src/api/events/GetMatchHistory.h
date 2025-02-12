#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"

class MatchHistory {
    using json = nlohmann::json;

    static json SerializeResponse(const pqxx::result& response, httplib::Response& res);

public:
    static void GetMatchHistoryRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static pqxx::result GetMatchHistory(const std::string& user_id, Database& db);
};


