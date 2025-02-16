#include "Preorder.h"

void Preorder::AddPreorderRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    if (req.path_params.at("id").empty()) {
        spdlog::error("Пропущен параметр id");
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }
    std::string user_id = req.path_params.at("id");

    if (!CheckUserExistence(user_id, db)) {
        spdlog::error("Пользователь с id {} не найден", user_id);
        ErrorHandler::sendError(res, 404, "User not found");
        return;
    }

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
        std::string preorder_id = AddPreorder(user_id, data, db);
        res.status = 201;
        json response = {
                {"message", "Preorder added successfully"},
                {"preorder_id", preorder_id}
        };
        res.set_content(response.dump(), "application/json");
    } catch (const std::exception& e) {
        spdlog::error("Error processing preorder request: {}", e.what());
        ErrorHandler::sendError(res, 500, "Internal server error");
    }
}

std::string Preorder::AddPreorder(const std::string& user_id, const PreorderData& data, Database& db) {
    std::string query = "INSERT INTO Users.Preorders (user_id, match_id, ticket_id, match_date) VALUES ($1, $2, $3, $4) RETURNING id";
    std::vector<std::string> params = {user_id, data.match_id, data.ticket_id, data.date};
    spdlog::info("Executing query: {} with params: {}, {}, {}, {}", query, user_id, data.match_id, data.ticket_id, data.date);
    pqxx::result response = db.executeQueryWithParams(query, params);
    spdlog::info("Preorder added with id: {}", response[0][0].c_str());

    if (response.empty()) {
        return "SHIT HAPPENS";
    }
    return response[0][0].as<std::string>();
}

bool Preorder::CheckUserExistence(const std::string& user_id, Database& db) {
    std::string query = "SELECT * FROM Users.UsersData WHERE user_id = $1";
    std::vector<std::string> params = {user_id};

    pqxx::result response = db.executeQueryWithParams(query, params);

    return !response.empty();
}