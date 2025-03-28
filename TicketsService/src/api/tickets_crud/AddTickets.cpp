#include "AddTickets.h"

httplib::Client AddTickets::client("http://queue-service:8020");

void AddTickets::AddingTicketsRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    std::string match_id;
    if (!req.path_params.at("match_id").empty()) {
        match_id = req.path_params.at("match_id");
    } else {
        spdlog::error("Не указан id матча, отказано в обновлении");
        ErrorHandler::sendError(res, 402, "Missing id parameter");
        return;
    }

    if (!req.has_file("tickets_crud")) {
        spdlog::error("Не указан файл с билетами, отказано в добавлении");
        ErrorHandler::sendError(res, 401, "Missing file with tickets_crud");
        return;
    }

    httplib::MultipartFormData file = req.get_file_value("tickets_crud");

    auto [invalid_rows, tickets] = GetTicketsFromCSV(file, res);

    for (const auto& ticket : tickets) {
        AddTicketToDatabase(match_id, ticket, db);
    }

    res.status = 201;
    json response = {
            {"message", "Tickets added successfully"},
            {"invalid_rows", invalid_rows}
    };
    res.set_content(response.dump(), "application/json");
}

void AddTickets::AddTicketToDatabase(const std::string &match_id, const AddTickets::Ticket &ticket, Database &db) {
    std::string query = "INSERT INTO Tickets.TicketsData(match_id, price, sector, row, seat) VALUES ($1, $2, $3, $4, $5)";
    std::vector<std::string> params = {match_id, ticket.price, ticket.sector, ticket.row, ticket.seat};
    try {
        db.executeQueryWithParams(query, params);
    } catch (const std::exception& e) {
        spdlog::error("Не удалось добавить билеты в БД");
        throw std::runtime_error("Failed to add tickets_crud to DB");
    }

    try{
        std::string ticket_id;
        GetTicketID(match_id, ticket.price, ticket.sector, ticket.row, ticket.seat, db, ticket_id);
        if (ticket_id.empty()) {
            spdlog::error("Не удалось получить id билета");
            throw std::runtime_error("Failed to get ticket ID");
        }
        spdlog::info("Получен id билета: {}", ticket_id);
        // Отправляем запрос на добавление билета в очередь
        json ticket_json = {
                {"match_id", match_id},
                {"price", ticket.price},
                {"ticket_id", ticket_id}
        };
        auto res = client.Post("/event", ticket_json.dump(), "application/json");
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

void AddTickets::GetTicketID(
    const std::string& match_id,
    const std::string& price,
    const std::string& sector,
    const std::string& row,
    const std::string& seat,
    Database& db,
    std::string& ticket_id
) {
    std::string query = "SELECT id FROM Tickets.TicketsData WHERE match_id = $1 AND price = $2 AND sector = $3 AND row = $4 AND seat = $5";
    std::vector<std::string> params = {match_id, price, sector, row, seat};
    try {
        auto result = db.executeQueryWithParams(query, params);
        if (!result.empty()) {
            ticket_id = result[0][0].as<std::string>();
        } else {
            spdlog::error("Не удалось получить id билета");
            throw std::runtime_error("Failed to get ticket ID");
        }
    } catch (const std::exception& e) {
        spdlog::error("Ошибка при получении id билета: {}", e.what());
    }
}
