#include "RedisWaitingList.h"

void RedisWaitingList::AddToWaitingListRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    if (req.path_params.at("id").empty()) {
        ErrorHandler::sendError(res, 400, "user_id is empty");
        return;
    }
    std::string user_id = req.path_params.at("id");
    TicketData ticket_data = TicketData::GetDataFromJSON(json::parse(req.body));

    std::string waiting_list_key = GetWaitingListKey(ticket_data.match_id);

    auto* reply = (redisReply*)redisCommand(reinterpret_cast<redisContext*>(redis),
                                                  "LPUSH %s %s", waiting_list_key.c_str(), user_id.c_str());

    if (reply == nullptr) {
        spdlog::error("failed to add user to waiting list: {}", redis->errstr);
        ErrorHandler::sendError(res, 400, "failed to add user to waiting list");
        return;
    }
    size_t queue_length = reply->integer;

    res.status = 200;
    json response = {
            {"status", "user added to waiting list"},
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
                                            "RPOP %s %s", waiting_list_key.c_str());
    if (reply == nullptr) {
        spdlog::error("failed to add user to waiting list: {}", redis->errstr);
        ErrorHandler::sendError(res, 400, "failed to add user to waiting list");
        return;
    }

    if (reply->type == REDIS_REPLY_STRING) {
        res.set_content(R"({"user_id": ")" + std::string(reply->str) + R"("})", "application/json");
    } else {
        res.set_content(R"({"status": "empty queue"})", "application/json");
    }
    freeReplyObject(reply);
}