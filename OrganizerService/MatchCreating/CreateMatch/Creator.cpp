#include "Creator.h"

void Creator::CreateMatchRequest(const httplib::Request& req, httplib::Response& res,
                        Database& db) {
    auto parsed = json::parse(req.body);
    int organizer_id = parsed["organizer_id"];
    std::string team_home = parsed["team_home"];
    std::string team_away = parsed["team_away"];
    std::string match_date = parsed["match_date"];
    std::string match_time = parsed["match_time"];
    std::string stadium = parsed["stadium"];
    std::string match_description = parsed["match_description"];

    if (CheckMatchExistence(team_home, team_away, match_date, db)) {
        res.status = 404;
        res.set_content(R"({"error": "Match already exists."})", "application/json");
        return;
    }

    pqxx::result result = db.createMatch(organizer_id, team_home, team_away, match_date, match_time, stadium, match_description);
    if (result.affected_rows() == 0) {
        res.status = 404;
        res.set_content(R"({"error": "Match not created."})", "application/json");
    } else {
        res.status = 200;
        res.set_content(R"({"status": "Match created successfully."})", "application/json");
    }
    return;
}

bool Creator::CheckMatchExistence(const std::string& team_home, const std::string& team_away, const std::string& match_date, Database& db) {
    std::string query = "SELECT team_home FROM Matches.MatchData WHERE team_home = $1 AND team_away = $2 AND match_date = $3";
    pqxx::result response = db.executeQueryWithParams(query, team_home, team_away, match_date);
    return !response.empty();
}