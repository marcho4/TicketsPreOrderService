#include "MatchCreator.h"
#include "../../FormatRegexHelper/ValidDataChecker.h"

void MatchCreator::CreateMatchRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    std::string organizer_id;
    if (!req.path_params.at("id").empty()) {
        organizer_id = req.path_params.at("id");
    } else {
        sendError(res, 400, "Missing id parameter");
        return;
    }
    // проверим, что id-шник валидный
    if (!DataCheker::isValidUUID(organizer_id)) {
        sendError(res, 400, "Invalid organizer_id format");
        return;
    }
    // проверим на то что данные существуют/не существуют в базе
    if (!CheckOrganizerExistence(organizer_id, db) || CheckMatchExistence(organizer_id, req.body, db)) {
        sendError(res, 409, "Organizer does not exists or match found");
        return;
    }

    auto parsed = json::parse(req.body);
    std::string team_home = parsed["team_home"];
    std::string team_away = parsed["team_away"];
    std::string match_datetime_to_parse = parsed["match_datetime"];
    std::string stadium = parsed["stadium"];
    std::string match_description = parsed["match_description"];
    std::cout << match_datetime_to_parse << '\n';
    match_datetime_to_parse = match_datetime_to_parse.substr(0, match_datetime_to_parse.find("Z"));
    std::replace(match_datetime_to_parse.begin(), match_datetime_to_parse.end(), 'T', ' ');

    std::string add_match_query = "INSERT INTO Organizers.Matches (organizer_id, team_home, team_away, match_datetime, "
                                  "stadium, match_description, created_at, updated_at) "
                                  "VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    std::vector<std::string> params = {organizer_id, team_home, team_away, match_datetime_to_parse, stadium, match_description};
    pqxx::result response = db.executeQueryWithParams(add_match_query, params);
    if (response.affected_rows() == 0) {
        sendError(res, 500, "Failed to create match");
        return;
    }
    res.status = 200;
    res.set_content(R"({"message": "Match created successfully"})", "application/json");
}

bool MatchCreator::CheckMatchExistence(const std::string& organizer_id, const std::string& match_body, Database& db) {
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

bool MatchCreator::CheckOrganizerExistence(const std::string& organizer_id, Database& db) {
    std::string query = "SELECT * FROM Organizers.OrganizersData WHERE organizer_id = $1";
    std::vector<std::string> params = {organizer_id};

    pqxx::result result = db.executeQueryWithParams(query, params);
    return !result.empty();
}

void MatchCreator::sendError(httplib::Response& res, int status, const std::string& message) {
    res.status = status;
    res.set_content(R"({"message": ")" + message + R"("})", "application/json");
}