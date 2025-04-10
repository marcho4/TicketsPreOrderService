#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/rotating_file_sink.h"

class UserPayments {
    using json = nlohmann::json;

    static pqxx::result GetPaymentsFromDb(Database& db, const std::string& user_id) {
        std::string query = "SELECT * FROM PaymentsSchema.Payments WHERE user_id = $1";
        std::vector<std::string> params = {user_id};
        return db.executeQueryWithParams(query, params);
    }

    static json GetPaymentsJsonList(const pqxx::result& payments) {
        json response = json::array();
        for (const auto& payment : payments) {
            json payment_json = {
                    {"payment_id", payment[0].as<std::string>()},
                    {"user_id", payment[1].as<std::string>()},
                    {"amount", payment[2].as<std::string>()},
                    {"currency", payment[3].as<std::string>()},
                    {"status", payment[4].as<std::string>()},
                    {"payment_id", payment[0].as<std::string>()},
                    {"match_id", payment[6].as<std::string>()},
                    {"ticket_id", payment[7].as<std::string>()},
                    {"created_at", payment[8].as<std::string>()}
            };
            response.push_back(payment_json);
        }
        return response;
    }

public:
    static void GetUserPayments(const httplib::Request& req, httplib::Response& res, Database& db) {
        if (req.path_params.at("id").empty()) {
            ErrorHandler::sendError(res, 400, "Missing user id");
            return;
        }
        std::string user_id = req.path_params.at("id");

        pqxx::result payments = GetPaymentsFromDb(db, user_id);

        json response = GetPaymentsJsonList(payments);

        res.status = 200;
        res.set_content(response.dump(), "application/json");
    }
};