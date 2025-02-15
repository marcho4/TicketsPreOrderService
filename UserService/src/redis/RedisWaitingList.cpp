#include "RedisWaitingList.h"

void RedisWaitingList::AddToWaitingListRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    if (req.path_params.at("id").empty()) {
        ErrorHandler::sendError(res, "user_id is empty");
        return;
    }
    std::string user_id = req.path_params.at("id");
    TicketData ticket_data = TicketData::GetDataFromJSON(json::parse(req.body));

    std::string waiting_list_key = GetWaitingListKey(ticket_data.match_id);
    redis.lpush(waiting_list_key, user_id);
    size_t queue_length = redis.llen(waiting_list_key);

    res.status = 200;
    json response = {
        {"status", "user added to waiting list"},
        {"match: " + ticket_data.match_id + " queue length:", queue_length}
    };
    res.set_content(response.dump(), "application/json");
}

void RedisWaitingList::ProcessNextUserRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    TicketData ticket_data = TicketData::GetDataFromJSON(json::parse(req.body));

    std::string waiting_list_key = GetWaitingListKey(ticket_data.match_id);

    auto user_id = redis.rpop(waiting_list_key);

    if (user_id) {
        res.set_content(R"({"user_id": ")" + *user_id + R"("})", "application/json");
    } else {
        res.set_content(R"({"status": "empty queue"})", "application/json");
    }
}