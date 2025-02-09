#include "UpdateTickets.h"

void UpdateTickets::AddingTicketsRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    std::string match_id;
    if (!req.path_params.at("match_id").empty()) {
        match_id = req.path_params.at("match_id");
    } else {
        spdlog::error("Не указан id матча, отказано в обновлении");
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }

    if (!req.has_file("tickets.csv")) {
        spdlog::error("Не указан файл с билетами, отказано в обновлении");
        ErrorHandler::sendError(res, 400, "Missing file with tickets");
        return;
    }

    httplib::MultipartFormData file = req.get_file_value("tickets.csv");

    std::vector<Ticket> tickets = GetTicketsFromCSV(file, res);

    for (const auto& ticket : tickets) {
        AddTicketToDatabase(match_id, ticket, db);
    }

    res.status = 201;
    res.set_content(R"({"message": "Tickets added successfully"})", "application/json");
}

void UpdateTickets::UpdateTicketInDatabase(const std::string &match_id, const UpdateTickets::Ticket &ticket,
                                           Database &db) {
    std::string query = "UPDATE Tickets.TicketsData SET price = $1, sector = $2, row = $3, seat = $4 WHERE match_id = $5";
    std::vector<std::string> params = {match_id, ticket.price, ticket.sector, ticket.row, ticket.seat};
    try {
        db.executeQueryWithParams(query, params);
    } catch (const std::exception& e) {
        spdlog::error("Не удалось добавить билеты в БД");
        throw std::runtime_error("Failed to add tickets to DB");
    }
}