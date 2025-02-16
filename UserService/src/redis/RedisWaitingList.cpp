#include "RedisWaitingList.h"

void RedisWaitingList::AddToWaitingListRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    if (req.path_params.at("id").empty()) {
        ErrorHandler::sendError(res, 400, "user_id is empty");
        spdlog::error("user_id is empty");
        return;
    }
    std::string user_id = req.path_params.at("id");

    if (!CheckUserExistence(user_id, res, db)) {
        spdlog::error("Пользователь с id {} не найден", user_id);
        ErrorHandler::sendError(res, 404, "user not found");
        return;
    }

    TicketData ticket_data = TicketData::GetDataFromJSON(json::parse(req.body));

    std::string waiting_list_key = GetWaitingListKey(ticket_data.match_id);

    auto* reply = (redisReply*)redisCommand(reinterpret_cast<redisContext*>(redis),
                                                  "LPUSH %s %s", waiting_list_key.c_str(), user_id.c_str());
    if (reply == nullptr) {
        spdlog::error("Не удалось добавить пользователя в лист ожидания: {}", redis->errstr);
        ErrorHandler::sendError(res, 400, "failed to add user to waiting list");
        return;
    }
    spdlog::info("Пользователь {} добавлен в очередь на матч {}", user_id, ticket_data.match_id);
    size_t queue_length = reply->integer;

    res.status = 200;
    json response = {
            {"message", "user added to waiting list"},
            {"match_id", ticket_data.match_id},
            {"queue_length", queue_length}
    };
    res.set_content(response.dump(), "application/json");
    freeReplyObject(reply);
}

void RedisWaitingList::ProcessNextUserRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    TicketData ticket_data = TicketData::GetDataFromJSON(json::parse(req.body));

    std::string waiting_list_key = GetWaitingListKey(ticket_data.match_id);

    auto* reply = (redisReply*)redisCommand(reinterpret_cast<redisContext*>(redis),
                                            "RPOP %s", waiting_list_key.c_str());
    if (reply == nullptr) {
        spdlog::error("failed to add user to waiting list: {}", redis->errstr);
        ErrorHandler::sendError(res, 400, "failed to add user to waiting list");
        return;
    }

    if (reply->type == REDIS_REPLY_STRING) {
        spdlog::info("Пользователь {} следуюший в очереди на матч {}", reply->str, ticket_data.match_id);
        res.set_content(R"({"user_id": ")" + std::string(reply->str) + R"("})", "application/json");
    } else {
        res.set_content(R"({"status": "empty queue"})", "application/json");
    }
    freeReplyObject(reply);
}

bool RedisWaitingList::CheckUserExistence(const std::string &user_id, httplib::Response &res, Database &db) {
    std::string query = "SELECT * FROM Users.UsersData WHERE user_id = $1";
    std::vector<std::string> params = {user_id};
    pqxx::result response = db.executeQueryWithParams(query, params);

    return !response.empty();
}

void RedisWaitingList::ClearWaitingListRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    if (req.path_params.at("id").empty()) {
        ErrorHandler::sendError(res, 400, "match_id is empty");
        spdlog::error("match_id is empty");
        return;
    }

    std::string match_id = req.path_params.at("id");
    std::string waiting_list_key = GetWaitingListKey(match_id);
    while (true) {
        auto* reply = (redisReply*)redisCommand(reinterpret_cast<redisContext*>(redis),
                                                "RPOP %s", waiting_list_key.c_str());
        if (reply == nullptr) {
            spdlog::error("Ошибка при отчистке листа ожидания: {}", redis->errstr);
            ErrorHandler::sendError(res, 400, "failed to clear waiting list");
            return;
        }
        if (reply->type == REDIS_REPLY_NIL) {
            break;
        }
        freeReplyObject(reply);
    }
    res.status = 200;
    json response = {
            {"message", "waiting list cleared"},
            {"match_id", match_id}
    };
    res.set_content(response.dump(), "application/json");
}