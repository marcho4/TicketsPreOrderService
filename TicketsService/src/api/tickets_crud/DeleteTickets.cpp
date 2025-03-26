#include "DeleteTickets.h"

void DeleteTickets::DeleteTicketsRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    if (req.path_params.at("match_id").empty()) {
        ErrorHandler::sendError(res, 400, "Missing match_id parameter");
        return;
    }

    std::string match_id = req.path_params.at("match_id");

    json parsed_json_body;
    try {
        parsed_json_body = json::parse(req.body);
    } catch (const std::exception &e) {
        spdlog::error("Не удалось распарсить JSON");
        ErrorHandler::sendError(res, 400, "Invalid JSON format");
        return;
    }

    if (!parsed_json_body.contains("ticket_ids")) {
        spdlog::error("Нет списка с id билетов, отказано в удалении");
        ErrorHandler::sendError(res, 400, "Missing ticket_ids parameter");
        return;
    }
    std::vector<std::string> ticket_ids;
    try {
        ticket_ids = parsed_json_body["ticket_ids"];
    } catch (const std::exception &e) {
        spdlog::error("Некорректный список ID");
        ErrorHandler::sendError(res, 400, "Wrong data fromat. SHould be array[string]");
        return;
    }

    int deleted_tickets = 0;
    int all_tickets = ticket_ids.size();

    for (const auto& ticket_id : ticket_ids) {
        if (DeleteTicket(ticket_id, db)) {
            deleted_tickets++;
        }
    }

    res.status = 201;
    json response = {
            {"message", "May be some tickets_crud was not removed because they are reserved"},
            {"deleted_tickets", deleted_tickets},
            {"all_tickets", all_tickets}
    };
    res.set_content(response.dump(), "application/json");
}

bool DeleteTickets::DeleteTicket(const std::string& ticket_id, Database& db) {
    std::string query = "SELECT status FROM Tickets.TicketsData WHERE id = $1";
    std::vector<std::string> params = {ticket_id};
    pqxx::result result = db.executeQueryWithParams(query, params);

    if (result.empty()) {
        spdlog::warn("Билет с id {} не найден", ticket_id);
        return false;
    }

    std::string status = result[0][0].c_str();

    if (status == "available") {
        query = "DELETE FROM Tickets.TicketsData WHERE id = $1";
        db.executeQueryWithParams(query, params);
        return true;
    }
    return false;
}