#include "GetTickets.h"

void GetTickets::GetTicketsRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    std::string match_id;
    if (!req.path_params.at("match_id").empty()) {
        match_id = req.path_params.at("match_id");
    } else {
        spdlog::error("Не указан id матча, отказано в обновлении");
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }

    pqxx::result tickets = GetTicketsFromDB(match_id, db);

    json json_response = GetListJSON(tickets);

    res.status = 200;
    res.set_content(json_response.dump(), "application/json");
}

pqxx::result GetTickets::GetTicketsFromDB(const std::string &match_id, Database &db) {
    std::string query = "SELECT * FROM Tickets.TicketsData WHERE match_id = $1";
    std::vector<std::string> params = {match_id};

    pqxx::result tickets = db.executeQueryWithParams(query, params);
    return tickets;
}