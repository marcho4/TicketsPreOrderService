#include "TicketsPaid.h"


void TicketsPaid::PayTicketsRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    if (req.path_params.at("id").empty()) {
        spdlog::error("Не указан id билета");
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }
    std::string ticket_id = req.path_params.at("id");

    Ticket ticket = Ticket::getTicketData(json::parse(req.body));

    try {
        PayTicket(ticket_id, ticket.user_id, ticket.match_id, db);
    } catch (const std::exception& e) {
        spdlog::error("Не удалось изменить статус билета на купленный");
        ErrorHandler::sendError(res, 500, "Failed to pay ticket");
        return;
    }

    res.status = 200;
    spdlog::info("Билет куплен пользователем: {}", ticket.user_id);
    res.set_content(R"({"message": "Ticket paid"})", "application/json");
}

void TicketsPaid::PayTicket(const std::string &ticket_id, const std::string &user_id,
                                       const std::string& match_id, Database &db) {

    std::string query = "UPDATE Tickets.TicketsData SET user_id = $1, status = $2 WHERE id = $3 AND match_id = $4";
    std::vector<std::string> params = {user_id, "sold", ticket_id, match_id};

    db.executeQueryWithParams(query, params);
}