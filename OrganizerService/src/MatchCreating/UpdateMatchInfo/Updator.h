#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../../postgres/PostgresProcessing.h"

class Updator {
    using json = nlohmann::json;

public:
    void UpdateMatchRequest(const httplib::Request& req, httplib::Response& res,
                            Database& db);

    bool CheckMatchExistence(int organizer_id, int match_id, Database& db);
};


