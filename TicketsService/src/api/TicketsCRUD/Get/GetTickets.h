#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "../../../postgres/PostgresProcessing.h"
#include "../../../../../PaymentService/src/ErrorHandler.h"
#include "../../../Helper.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>


class GetTickets {
    using json = nlohmann::json;

    static json GetListJSON(pqxx::result& response) {
        json json_body = json::array();

        for (const auto& row : response) {
            json request;

            request["id"]       = row["id"].is_null() ? "" : row["id"].as<std::string>();
            request["match_id"] = row["match_id"].is_null() ? "" : row["match_id"].as<std::string>();
            request["user_id"]  = row["user_id"].is_null() ? "" : row["user_id"].as<std::string>();
            request["price"]    = row["price"].is_null() ? "" : row["price"].as<std::string>();
            request["sector"]   = row["sector"].is_null() ? "" : row["sector"].as<std::string>();
            request["row"]      = row["row"].is_null() ? "" : row["row"].as<std::string>();
            request["seat"]     = row["seat"].is_null() ? "" : row["seat"].as<std::string>();
            request["status"]   = row["status"].is_null() ? "" : row["status"].as<std::string>();

            json_body.push_back(request);
        }

        return json_body;
    }

public:
    static void GetTicketsRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static pqxx::result GetTicketsFromDB(const std::string& match_id, Database& db);
};
