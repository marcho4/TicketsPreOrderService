#include "CancelReservation.h"

httplib::Client CancelReservation::client("http://queue-processor:8020");

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
    

    try{
        int price = CancelReservation::GetTicketPrice(ticket_id, match_id, db);
        if (price == -1) {
            spdlog::error("Не удалось получить цену билета");
            throw std::runtime_error("Failed to get ticket price");
        }

        // Отправляем запрос на добавление билета в очередь
        json ticket_json = {
                {"match_id", match_id},
                {"price", price},
                {"ticket_id", ticket_id}
        };
        auto res = CancelReservation::client.Post("/event", ticket_json.dump(), "application/json");
        if (res && res->status == 200) {
            spdlog::info("Билет успешно добавлен в очередь");
        } else {
            spdlog::error("Не удалось добавить билет в очередь");
            throw std::runtime_error("Failed to add ticket to queue");
        }
    } catch (const std::exception& e) {
        spdlog::error("Ошибка при добавлении билета в очередь: {}", e.what());
    }
}

int CancelReservation::GetTicketPrice(const std::string &ticket_id, const std::string &match_id, Database &db) {
    std::string query = "SELECT price FROM Tickets.TicketsData WHERE id = $1 AND match_id = $2";
    std::vector<std::string> params = {ticket_id, match_id};

    try {
        auto result = db.executeQueryWithParams(query, params);
        if (result.empty()) {
            spdlog::error("Не удалось получить цену билета");
            throw std::runtime_error("Failed to get ticket price");
        }
        int price = result[0][0].as<int>();
        return price;
    } catch (const std::exception& e) {
        spdlog::error("Ошибка при получении цены билета: {}", e.what());
        return -1;
    }
}