#include "AddTickets.h"

void AddTickets::AddingTicketsRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    std::string match_id;
    if (!req.path_params.at("match_id").empty()) {
        match_id = req.path_params.at("match_id");
    } else {
        spdlog::error("Не указан id матча, отказано в обновлении");
        ErrorHandler::sendError(res, 402, "Missing id parameter");
        return;
    }

    if (!req.has_file("tickets")) {
        spdlog::error("Не указан файл с билетами, отказано в добавлении");
        ErrorHandler::sendError(res, 401, "Missing file with tickets");
        return;
    }

    httplib::MultipartFormData file = req.get_file_value("tickets");

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
        throw std::runtime_error("Failed to add tickets to DB");
    }
}