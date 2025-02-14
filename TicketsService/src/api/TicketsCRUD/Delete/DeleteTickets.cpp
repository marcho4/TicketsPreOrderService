#include "DeleteTickets.h"

void DeleteTickets::DeleteTicketsRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    if (req.path_params.at("match_id").empty()) {
        ErrorHandler::sendError(res, 400, "Missing match_id parameter");
        return;
    }

    std::string match_id = req.path_params.at("match_id");

    if (!req.has_file("tickets")) {
        spdlog::error("Не указан файл с билетами, отказано в добавлении");
        ErrorHandler::sendError(res, 401, "Missing file with tickets");
        return;
    }

    httplib::MultipartFormData file = req.get_file_value("tickets");

    auto [invalid_rows, tickets] = GetTicketsFromCSV(file, res);

    int deleted_tickets = 0;
    int all_tickets = invalid_rows + tickets.size();

    for (const auto& ticket : tickets) {
        if (DeleteTicket(match_id, ticket.sector, ticket.row, ticket.seat, db)) {
            deleted_tickets++;
        }
    }

    res.status = 201;
    json response = {
            {"message", "May be some tickets was not removed because they are reserved"},
            {"invalid_rows", invalid_rows},
            {"deleted_tickets", deleted_tickets},
            {"all_tickets", all_tickets}
    };
    res.set_content(response.dump(), "application/json");
}

bool DeleteTickets::DeleteTicket(const std::string& match_id, const std::string& sector,
                                 const std::string& row, const std::string& seat, Database& db) {
    std::string query = "SELECT status FROM Tickets.TicketsData WHERE match_id = $1 "
                        "AND sector = $2 AND row = $3 AND seat = $4";
    std::vector<std::string> params = {match_id, sector, row, seat};
    pqxx::result result = db.executeQueryWithParams(query, params);

    std::string status = result[0][0].c_str();

    if (status == "available") {
        query = "DELETE FROM Tickets.TicketsData  WHERE match_id = $1 "
                "AND sector = $2 AND row = $3 AND seat = $4";
        db.executeQueryWithParams(query, params);
        return true;
    }
    return false;
}