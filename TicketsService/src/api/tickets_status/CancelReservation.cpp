#include "CancelReservation.h"


 void CancelReservation::CancelReservationRequest(const httplib::Request &req, httplib::Response &res,
                                                        Database &db) {
    if (req.path_params.at("id").empty()) {
        spdlog::error("Не указан id билета");
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }

    std::string ticket_id = req.path_params.at("id");

    Ticket ticket = Ticket::getTicketData(json::parse(req.body));

    try {
        CancelTicketReservation(ticket_id, ticket.match_id, db);
    } catch (const std::exception& e) {
        spdlog::error("Не удалось отменить бронирование билета {}", ticket_id);
        ErrorHandler::sendError(res, 500, "Failed to cancel ticket reservation");
        return;
    }

    res.status = 200;
    spdlog::info("Бронирование билета {} отменено пользователем", ticket_id);
    res.set_content(R"({"message": "Ticket reservation canceled"})", "application/json");
}

void CancelReservation::CancelTicketReservation(const std::string &ticket_id,
                                                const std::string &match_id, Database &db) {
    std::string query = "UPDATE Tickets.TicketsData SET user_id = $1, status = $2 WHERE id = $3 AND match_id = $4";
    std::vector<std::string> params = {"", "available", ticket_id, match_id};

    db.executeQueryWithParams(query, params);
}