#include "Preorder.h"

void Preorder::AddPreorderRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    if (req.path_params.at("id").empty()) {
        spdlog::error("Пропущен параметр id");
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }
    std::string user_id = req.path_params.at("id");

    json parsed;
    try {
        parsed = json::parse(req.body);
    } catch (const json::parse_error&) {
        spdlog::error("Неверный формат JSON");
        ErrorHandler::sendError(res, 400, "Invalid JSON format");
        return;
    }

    if (!parsed.contains("match_id") || !parsed.contains("ticket_id") || !parsed.contains("match_datetime")) {
        ErrorHandler::sendError(res, 400, "Missing required fields");
        return;
    }

    try {
        PreorderData data = PreorderData::GetDataFromRequest(parsed);
        AddPreorder(user_id, data, db);
        res.status = 201;
        res.set_content(R"({"message": "Preorder added successfully"})", "application/json");
    } catch (const std::exception& e) {
        spdlog::error("Error processing preorder request: {}", e.what());
        ErrorHandler::sendError(res, 500, "Internal server error");
    }
}

void Preorder::AddPreorder(const std::string& user_id, PreorderData data, Database& db) {
    std::string query = "INSERT INTO Users.Preorders (user_id, match_id, ticket_id, date) VALUES ($1, $2, $3, $4)";
    std::vector<std::string> params = {user_id, data.match_id, data.ticket_id, data.date};

    db.executeQueryWithParams(query, params);
}