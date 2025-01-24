#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../../postgres/PostgresProcessing.h"
#include "../../FormatRegexHelper/ValidDataChecker.h"

class MatchUpdator {
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
    static void UpdateMatchRequest(const httplib::Request& req, httplib::Response& res,
                            Database& db);

    static bool CheckMatchExistence(const std::string& organizer_id, const std::string& match_body, Database& db);

    static bool CheckOrganizerExistence(const std::string& organizer_id, Database& db);

    static void sendError(httplib::Response& res, int status, const std::string& message);
};

class MatchValidator {
public:
    static bool ValidateMatchUpdating(nlohmann::json& parsed, httplib::Response& res, std::string organizer_id,
                               Database& db, const httplib::Request& req) {
        if (parsed.find("team_home") == parsed.end() || parsed.find("team_away") == parsed.end() ||
            parsed.find("match_datetime") == parsed.end() || parsed.find("stadium") == parsed.end() ||
            parsed.find("match_description") == parsed.end()) {
            MatchUpdator::sendError(res, 400, "Missing required fields");
            return false;
        }
        // проверим, что id-шник валидный
        if (!DataCheker::isValidUUID(organizer_id)) {
            MatchUpdator::sendError(res, 400, "Invalid organizer_id format");
            return false;
        }
        // проверим на то что данные существуют/не существуют в базе
        if (!MatchUpdator::CheckOrganizerExistence(organizer_id, db)
        || MatchUpdator::CheckMatchExistence(organizer_id, req.body, db)) {
            MatchUpdator::sendError(res, 409, "Organizer does not exists or match found");
            return false;
        }
        return true;
    }
};

