#include "GetTicket.h"


void GetTicket::GetTicketByIdRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    std::string ticket_id;
    
    // Проверка, что параметр ticket_id не пуст
    if (!req.path_params.at("ticket_id").empty()) {
        ticket_id = req.path_params.at("ticket_id");
    } else {
        spdlog::error("Не указан id билета, отказано в получении информации о билете");
        ErrorHandler::sendError(res, 400, "Missing ticket_id parameter");
        return;
    }

    // Запрашиваем билет из базы данных
    pqxx::result ticket_result = GetTicketByIdFromDB(ticket_id, db);

    // Проверяем, что билеты нашлись
    if (ticket_result.empty()) {
        spdlog::error("Билет с id={} не найден", ticket_id);
        ErrorHandler::sendError(res, 404, "Ticket not found");
        return;
    }

    // Формируем JSON-объект на основе первой (и в данном случае единственной) строки
    nlohmann::json json_response = GetSingleTicketJSON(ticket_result[0]);

    // Формируем ответ
    res.status = 200;
    res.set_content(json_response.dump(), "application/json");
}

pqxx::result GetTicket::GetTicketByIdFromDB(const std::string& ticket_id, Database& db) {
    std::string query = "SELECT * FROM Tickets.TicketsData WHERE id = $1";
    std::vector<std::string> params = { ticket_id };

    return db.executeQueryWithParams(query, params);
}