#include "../../../libraries/httplib.h"
#include "../../postgres/PostgresProcessing.h"
#include "../../../libraries/nlohmann/json.hpp"

class GetMatchData {
    using json = nlohmann::json;

public:
    static void GetMatchInfoRequest(const httplib::Request& req, httplib::Response& res,
                             Database& db);

    static void sendError(httplib::Response& res, int status, const std::string& message);

    static nlohmann::json getMatchInfoJson(const std::string& organizer_id,
                                                      const std::string& match_id, Database& db);
};

class SqlWorker {
public:
    static bool CheckOrganizerAndMatchExistence(const std::string& organizer_id,
                                                const std::string& match_id, Database& db) {
        std::string request = "SELECT * FROM Organizers.Matches WHERE organizer_id = $1 AND match_id = $2";
        std::vector<std::string> params = {organizer_id, match_id};

        pqxx::result response = db.executeQueryWithParams(request, params);

        return !response.empty();
    }

    static pqxx::result GetMatchDataFromDB(const std::string& organizer_id, const std::string& match_id,
                                    Database& db) {
        std::string request = "SELECT * FROM Organizers.Matches WHERE organizer_id = $1 AND match_id = $2";
        std::vector<std::string> params = {organizer_id, match_id};

        pqxx::result response = db.executeQueryWithParams(request, params);

        return response;
    }
};
