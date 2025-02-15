#include <sw/redis++/redis++.h>
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../database/Database.h"
#include "../utils/ErrorHandler.h"

class RedisWaitingList {
    using Redis = sw::redis::Redis;
    using json = nlohmann::json;
    Redis redis;

    struct TicketData {
        std::string match_id;

        static TicketData GetDataFromJSON(const json& parsed) {
            return {
                parsed["match_id"].get<std::string>()
            };
        }
    };

    static std::string GetWaitingListKey(const std::string& match_id) {
        return "waiting_list:" + match_id;
    }

public:
    RedisWaitingList(const std::string& host) : redis(host) {}

    void AddToWaitingListRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    void ProcessNextUserRequest(const httplib::Request& req, httplib::Response& res, Database& db);
};

