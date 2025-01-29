#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "../../postgres/PostgresProcessing.h"

class GetMatchHistory {
    using json = nlohmann::json;

public:
    void GetMatchHistoryRequest(const httplib::Request& req, httplib::Response& res, Database& db);
};


