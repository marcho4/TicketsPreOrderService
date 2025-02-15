#include "GetUsersTickets.h"

void GetTickets::GetUserTicketsRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    std::string user_id;
    if (!req.path_params.at("id").empty()) {
        user_id = req.path_params.at("id");
    } else {
        spdlog::error("Не указан id пользователя, отказано в обновлении");
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }

    pqxx::result tickets = GetUsersTicketsFromDB(user_id, db);

    json json_response = GetTicketsListJSON(tickets);

    res.status = 200;
    res.set_content(json_response.dump(), "application/json");
}

pqxx::result GetTickets::GetUsersTicketsFromDB(const std::string &user_id, Database &db) {
    std::string query = "SELECT * FROM Tickets.TicketsData WHERE user_id = $1";
    std::vector<std::string> params = {match_id};

    pqxx::result tickets = db.executeQueryWithParams(query, params);
    return tickets;
}