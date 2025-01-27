#include "GetMatchData.h"

void GetMatchData::GetMatchInfoRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db) {
    std::string organizer_id, match_id;

    auto organizer_id_it = req.path_params.find("organizer_id");
    auto match_id_it = req.path_params.find("match_id");

    if (organizer_id_it != req.path_params.end() && match_id_it != req.path_params.end()) {
        organizer_id = organizer_id_it->second;
        match_id = match_id_it->second;
    } else {
        sendError(res, 400, "Missing id parameter");
        return;
    }

    // проверка существования организатора и матча
    if (!SqlWorker::CheckOrganizerAndMatchExistence(organizer_id, match_id, db)) {
        sendError(res, 403, "Access denied");
        return;
    }

    try {
        json match_info_json = getMatchInfoJson(organizer_id, match_id, db);

        res.status = 200;
        res.set_content(match_info_json.dump(), "application/json");
    } catch (const std::exception& ex) {
        sendError(res, 500, ex.what());
    }
}

void GetMatchData::sendError(httplib::Response& res, int status, const std::string& message) {
    nlohmann::json error_response = {
            {"status", status},
            {"message", message}
    };
    res.status = status;
    res.set_content(error_response.dump(), "application/json");
}

nlohmann::json GetMatchData::getMatchInfoJson(const std::string& organizer_id,
                                              const std::string& match_id, Database& db) {
    pqxx::result match_info = SqlWorker::GetMatchDataFromDB(organizer_id, match_id, db);

    if (match_info.empty()) {
        throw std::runtime_error("Match data not found");
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