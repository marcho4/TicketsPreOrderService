#include "PreorderCancel.h"

void PreorderCancellation::CancelPreorderRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    if (req.path_params.at("id").empty()) {
        spdlog::error("Не передан id пользователя");
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }
    std::string user_id = req.path_params.at("id");
    if (!CheckUserExistence(user_id, db)) {
        spdlog::error("Пользователь с id {} не найден", user_id);
        ErrorHandler::sendError(res, 404, "User not found");
        return;
    }

    auto parsed = json::parse(req.body);

    PreorderData data = PreorderData::GetDataFromRequest(parsed);

    if (!CheckPreorderExistence(user_id, data.match_id, data.ticket_id, db)) {
        spdlog::warn("Попытка отменить несуществующий предзаказ");
        ErrorHandler::sendError(res, 404, "Preorder not found");
        return;
    }

    try {
        CancelPreorder(user_id, data.match_id, data.ticket_id, db);
        spdlog::info("Предзаказ c билетом {} успешно отменен, пользователь: {}", data.ticket_id, user_id);
    } catch (const std::exception& e) {
        spdlog::error("Не удалось отменить предзаказ");
        ErrorHandler::sendError(res, 500, "Failed to cancel preorder");
        return;
    }
}

void PreorderCancellation::CancelPreorder(const std::string& user_id, const std::string& match_id, const std::string& ticket_id, Database& db) {
    std::string query = "DELETE FROM Users.Preorders WHERE user_id = $1 AND match_id = $2 AND ticket_id = $3";
    std::vector<std::string> params = {user_id, match_id, ticket_id};

    pqxx::result response = db.executeQueryWithParams(query, params);
}

bool PreorderCancellation::CheckPreorderExistence(const std::string& user_id, const std::string& match_id,
                                                  const std::string& ticket_id, Database& db) {
    std::string query = "SELECT * FROM Users.Preorders WHERE user_id = $1 AND match_id = $2 AND ticket_id = $3";
    std::vector<std::string> params = {user_id, match_id, ticket_id};

    pqxx::result response = db.executeQueryWithParams(query, params);

    return !response.empty();
}

bool PreorderCancellation::CheckUserExistence(const std::string &user_id, Database &db) {
    std::string query = "SELECT * FROM Users.UsersData WHERE user_id = $1";
    std::vector<std::string> params = {user_id};

    pqxx::result response = db.executeQueryWithParams(query, params);

    return !response.empty();
}