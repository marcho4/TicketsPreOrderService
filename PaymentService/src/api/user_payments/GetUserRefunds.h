#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/rotating_file_sink.h"

class UserRefunds {
    using json = nlohmann::json;

    static pqxx::result GetRefundsFromDb(Database& db, const std::string& user_id) {
        std::string query = "SELECT * FROM PaymentsSchema.Refunds WHERE user_id = $1";
        std::vector<std::string> params = {user_id};
        return db.executeQueryWithParams(query, params);
    }

    static json GetRefundsJsonList(const pqxx::result& payments) {
        json response = json::array();
        for (const auto& payment : payments) {
            json payment_json = {
                    {"refund_id", payment[0].as<std::string>()},
                    {"payment_id", payment[1].as<std::string>()},
                    {"user_id", payment[2].as<std::string>()},
                    {"status", payment[3].as<std::string>()},
                    {"created_at", payment[4].as<std::string>()}
            };
            response.push_back(payment_json);
        }
        return response;
    }

public:
    static void GetUserRefunds(const httplib::Request& req, httplib::Response& res, Database& db) {
        if (req.path_params.at("id").empty()) {
            ErrorHandler::sendError(res, 400, "Missing user id");
            return;
        }
        std::string user_id = req.path_params.at("id");

        pqxx::result refunds = GetRefundsFromDb(db, user_id);

        json response = GetRefundsJsonList(refunds);

        res.status = 200;
        res.set_content(response.dump(), "application/json");
    }
};