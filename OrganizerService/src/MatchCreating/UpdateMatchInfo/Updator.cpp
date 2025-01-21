#include "Updator.h"

// /organizer/{id}/update_match/{match_id}

void Updator::UpdateMatchRequest(const httplib::Request& req, httplib::Response& res,
                                 Database& db) {

    int organizer_id = std::stoi(req.matches[1]); // надеюсь правильно высосал id-шники
    int match_id = std::stoi(req.matches[2]); // надеюсь правильно высосал id-шники

    auto parsed = json::parse(req.body);
    std::string team_home = parsed["team_home"];
    std::string team_away = parsed["team_away"];
    std::string match_date = parsed["match_date"];
    std::string match_time = parsed["match_time"];
    std::string stadium = parsed["stadium"];
    std::string match_description = parsed["match_description"];

    if (!CheckMatchExistence(organizer_id, match_id, db)) {
        res.status = 404;
        res.set_content(R"({"error": "Match already exists."})", "application/json");
        return;
    }

//    pqxx::result result = db.createMatch(organizer_id, team_home, team_away, match_date, match_time, stadium, match_description);
//    if (result.affected_rows() == 0) {
//        res.status = 404;
//        res.set_content(R"({"error": "Match not created."})", "application/json");
//    } else {
//        res.status = 200;
//        res.set_content(R"({"status": "Match created successfully."})", "application/json");
//    }
//    return;
}

bool Updator::CheckMatchExistence(int organizer_id, int match_id, Database& db) {
//    std::string query = "SELECT team_home FROM Matches.MatchData WHERE organizer_id = $1 AND match_id = $2";
//    pqxx::result response = db.executeQueryWithParams(query, organizer_id, match_id);
//    return !response.empty();
}