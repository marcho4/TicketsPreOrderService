#include "Updator.h"

void Updator::UpdateMatchRequest(const httplib::Request& req, httplib::Response& res,
                                 Database& db) {


    // короче тут я как-то с фронта должен высосать id-шник матча чтобы что-то менять
    int id = 1; // бла бла бла

    // -------------------------------------------------------------------------------


    auto parsed = json::parse(req.body);
    int organizer_id = parsed["organizer_id"];
    std::string team_home = parsed["team_home"];
    std::string team_away = parsed["team_away"];
    std::string match_date = parsed["match_date"];
    std::string match_time = parsed["match_time"];
    std::string stadium = parsed["stadium"];
    std::string match_description = parsed["match_description"];

    if (!CheckMatchExistence(id, db)) {
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

bool Updator::CheckMatchExistence(int id, Database& db) {
    std::string query = "SELECT team_home FROM Matches.MatchData WHERE match_id = $1";
    pqxx::result response = db.executeQueryWithParams(query, std::to_string(id));
    return !response.empty();
}