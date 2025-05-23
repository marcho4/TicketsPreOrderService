#include "Updator.h"

void MatchUpdator::UpdateMatchRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    std::string organizer_id;
    if (!req.path_params.at("id").empty()) {
        organizer_id = req.path_params.at("id");
    } else {
        sendError(res, 400, "Missing id parameter");
        return;
    }

    auto parsed = json::parse(req.body);

    if (!MatchValidator::ValidateMatchUpdating(parsed, res, organizer_id, db, req)) {
        return;
    }

    MatchData data = MatchData::getDataFromRequest(parsed);

    std::string add_match_query = "INSERT INTO Organizers.Matches (organizer_id, team_home, team_away, match_datetime, "
                                  "stadium, match_description, created_at, updated_at) "
                                  "VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";

    std::vector<std::string> params = {organizer_id, data.team_home, data.team_away,
                                       data.match_datetime, data.stadium, data.match_description};

    pqxx::result response = db.executeQueryWithParams(add_match_query, params);
    if (response.affected_rows() == 0) {
        sendError(res, 500, "Failed to create match");
        return;
    }
    res.status = 200;
    res.set_content(R"({"message": "Match created successfully"})", "application/json");
}

bool MatchUpdator::CheckMatchExistence(const std::string& organizer_id, const std::string& match_body, Database& db) {
    auto parsed = json::parse(match_body);
    std::string team_home = parsed["team_home"];
    std::string team_away = parsed["team_away"];
    std::string match_date = parsed["match_datetime"];

    std::string query = "SELECT * FROM Organizers.Matches WHERE team_home = $1 "
                        "AND team_away = $2 AND match_datetime = $3 AND organizer_id = $4";

    std::vector<std::string> params = {team_home, team_away, match_date, organizer_id};
    pqxx::result result = db.executeQueryWithParams(query, params);

    return !result.empty();
}

bool MatchUpdator::CheckOrganizerExistence(const std::string& organizer_id, Database& db) {
    std::string query = "SELECT * FROM Organizers.OrganizersData WHERE organizer_id = $1";
    std::vector<std::string> params = {organizer_id};

    pqxx::result result = db.executeQueryWithParams(query, params);
    return !result.empty();
}

void MatchUpdator::sendError(httplib::Response& res, int status, const std::string& message) {
    res.status = status;
    res.set_content(R"({"message": ")" + message + R"("})", "application/json");
}