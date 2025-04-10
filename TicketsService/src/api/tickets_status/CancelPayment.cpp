#include "CancelPayment.h" 


void CancelPayment::CancelPaymentRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    if (req.path_params.at("id").empty()) {
        spdlog::error("Не указан id билета");
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }
    std::string ticket_id = req.path_params.at("id");

    Ticket ticket = Ticket::getTicketData(json::parse(req.body));

    try {
        CancelPay(ticket_id, ticket.user_id, ticket.match_id, db);
    } catch (const std::exception& e) {
        spdlog::error("Не удалось вернуть средства за билет");
        ErrorHandler::sendError(res, 500, "Failed to refund ticket");
        return;
    }

    res.status = 200;
    spdlog::info("Билет возвращен пользователем: {}", ticket.user_id);
    res.set_content(R"({"message": "Ticket refund"})", "application/json");
}

void CancelPayment::CancelPay(const std::string &ticket_id, const std::string &user_id,
                                       const std::string& match_id, Database &db) {

    std::string query = "UPDATE Tickets.TicketsData SET user_id = $1, status = $2 WHERE id = $3 AND match_id = $4";
    std::vector<std::string> params = {user_id, "reserved", ticket_id, match_id};

    db.executeQueryWithParams(query, params);
}