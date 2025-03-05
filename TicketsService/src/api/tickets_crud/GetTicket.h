#pragma once

#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "../../utils/Helper.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>

class GetTicket {
    using json = nlohmann::json;

    static json GetSingleTicketJSON(const pqxx::row& row) {
        json ticket_json;

        ticket_json["id"]       = row["id"].is_null()       ? "" : row["id"].as<std::string>();
        ticket_json["match_id"] = row["match_id"].is_null() ? "" : row["match_id"].as<std::string>();
        ticket_json["user_id"]  = row["user_id"].is_null()  ? "" : row["user_id"].as<std::string>();
        ticket_json["price"]    = row["price"].is_null()    ? "" : row["price"].as<std::string>();
        ticket_json["sector"]   = row["sector"].is_null()   ? "" : row["sector"].as<std::string>();
        ticket_json["row"]      = row["row"].is_null()      ? "" : row["row"].as<std::string>();
        ticket_json["seat"]     = row["seat"].is_null()     ? "" : row["seat"].as<std::string>();
        ticket_json["status"]   = row["status"].is_null()   ? "" : row["status"].as<std::string>();

        return ticket_json;
    }

public:
    static void GetTicketByIdRequest(const httplib::Request& req, httplib::Response& res, Database& db);
    static pqxx::result GetTicketByIdFromDB(const std::string& ticket_id, Database& db);
};
