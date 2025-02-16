#include <hiredis/hiredis.h>
#include <spdlog/spdlog.h>
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../database/Database.h"
#include "../utils/ErrorHandler.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../database/Database.h"
#include "../utils/ErrorHandler.h"

class RedisWaitingList {
    using Redis = redisContext*;
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

    static bool CheckUserExistence(const std::string& user_id, httplib::Response& res, Database& db);

public:
    RedisWaitingList(const std::string& host, int port) {
        redis = redisConnect(host.c_str(), port);
        if (redis == nullptr || redis->err) {
            if (redis) {
                spdlog::error("Redis connection error: {}", redis->errstr);
                redisFree(redis);
            } else {
                spdlog::error("Can't allocate redis context");
            }
            exit(1);
        }
    }

    ~RedisWaitingList() {
        if (redis) {
            redisFree(redis);
        }
    }

    void ProcessNextUserRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    void AddToWaitingListRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    void ClearWaitingListRequest(const httplib::Request& req, httplib::Response& res, Database& db);
};



