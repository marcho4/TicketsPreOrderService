#include "GetMatchData.h"

void GetMatchData::GetMatchInfoRequest(const httplib::Request& req, httplib::Response& res,
                                Database& db) {
    std::string organizer_id, match_id;

    if (!req.path_params.at("organizer_id").empty() && !req.path_params.at("match_id").empty()) {
        organizer_id = req.path_params.at("organizer_id");
        match_id = req.path_params.at("match_id");
    } else {
        sendError(res, 400, "Missing id parameter");
        return;
    }
    if (!SqlWorker::CheckOrganizerAndMatchExistence(organizer_id, match_id, db)) {
        sendError(res, 403, "Access denied");
        return;
    }

    json match_info_json = getMatchInfoJson(organizer_id, match_id, db);

    res.status = 200;
    res.set_content(match_info_json.dump(), "application/json");
}

void GetMatchData::sendError(httplib::Response& res, int status, const std::string& message) {
    res.status = status;
    res.set_content(R"({"message": ")" + message + R"("})", "application/json");
}

nlohmann::json GetMatchData::getMatchInfoJson(const std::string& organizer_id,
                                                  const std::string& match_id, Database& db) {
    pqxx::result match_info = SqlWorker::GetMatchDataFromDB(organizer_id, match_id, db);
    if (match_info.empty()) {
        throw std::runtime_error("Failed to retrieve organizer data");
    }
    return {
            {"team_home", match_info[0]["team_home"].as<std::string>()},
            {"team_away", match_info[0]["team_away"].as<std::string>()},
            {"match_datetime", match_info[0]["match_datetime"].as<std::string>()},
            {"stadium", match_info[0]["stadium"].as<std::string>()},
            {"match_description", match_info[0]["match_description"].as<std::string>()},
            {"match_status", match_info[0]["match_status"].as<std::string>()}
    };
}