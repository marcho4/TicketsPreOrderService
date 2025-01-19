#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../../postgres/PostgresProcessing.h"

class MatchCreator {
    using json = nlohmann::json;

public:
    void CreateMatchRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);

    bool CheckMatchExistence(const std::string& organizer_id, const std::string& match_body, Database& db);

    bool CheckOrganizerExistence(const std::string& organizer_id, Database& db);

    void sendError(httplib::Response& res, int status, const std::string& message);
};


