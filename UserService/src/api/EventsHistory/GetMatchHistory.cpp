#include "GetMatchHistory.h"

void MatchHistory::GetMatchHistoryRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    if (req.path_params.at("id").empty()) {
        ErrorHandler::sendError(res, 400, "Missing id parameter");
    }

    std::string user_id = req.path_params.at("id");

    pqxx::result response = GetMatchHistory(user_id, db);

    json result = SerializeResponse(response, res);

    res.status = 200;
    res.set_content(result.dump(), "application/json");
}

pqxx::result MatchHistory::GetMatchHistory(const std::string &user_id, Database &db) {
    std::string query = "SELECT * FROM Users.AttendedEvents WHERE user_id = $1";
    std::vector<std::string> params = {user_id};
    pqxx::result response = db.executeQueryWithParams(query, params);

    return response;
}

nlohmann::json MatchHistory::SerializeResponse(const pqxx::result &response, httplib::Response &res) {
    json result = json::array();

    for (int i = 0; i < response.size(); ++i) {
        json event;
        event["match_id"] = response[i][1].c_str();
        event["ticket_id"] = response[i][2].c_str();

        result.push_back(event);
    }

    return result;
}