#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../../postgres/PostgresProcessing.h"

class MatchCreator {
    using json = nlohmann::json;

    struct MatchData {
        std::string team_home;
        std::string team_away;
        std::string match_datetime;
        std::string stadium;
        std::string match_description;

        static MatchData getDataFromRequest(json& parsed) {
            std::string team_home = parsed["team_home"];
            std::string team_away = parsed["team_away"];
            std::string match_datetime_to_parse = parsed["match_datetime"];
            std::string stadium = parsed["stadium"];
            std::string match_description = parsed["match_description"];
            match_datetime_to_parse = match_datetime_to_parse.substr(0, match_datetime_to_parse.find("Z"));
            std::replace(match_datetime_to_parse.begin(), match_datetime_to_parse.end(), 'T', ' ');

            return {team_home, team_away, match_datetime_to_parse, stadium, match_description};
        }
    };

public:
    void CreateMatchRequest(const httplib::Request& req, httplib::Response& res,
                                   Database& db);

    bool CheckMatchExistence(const std::string& organizer_id, const std::string& match_body, Database& db);

    bool CheckOrganizerExistence(const std::string& organizer_id, Database& db);

    void sendError(httplib::Response& res, int status, const std::string& message);
};


