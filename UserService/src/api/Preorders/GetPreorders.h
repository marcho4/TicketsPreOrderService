#include <iostream>
#include "spdlog/spdlog.h"
#include "spdlog/sinks/rotating_file_sink.h"
#include "../../../libraries/httplib.h"
#include "../../ErrorHandler.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "../../postgres/PostgresProcessing.h"

class Preorders {
    using json = nlohmann::json;

    static json SerializeResponse(const pqxx::result& response, httplib::Response& res) {
        json result = json::array();

        for (int i = 0; i < response.size(); ++i) {
            json preorder;
            preorder["match_id"] = response[i][1].c_str();
            preorder["ticket_id"] = response[i][2].c_str();
            preorder["date"] = response[i][3].c_str();

            result.push_back(preorder);
        }

        return result;
    }

public:
    static void GetPreordersRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
        if (req.path_params.at("id").empty()) {
            spdlog::error("Пропущен параметр id");
            ErrorHandler::sendError(res, 400, "Missing id parameter");
            return;
        }
        std::string user_id = req.path_params.at("id");

        pqxx::result response = GetPreorders(user_id, db);

        json result = SerializeResponse(response, res);

        res.status = 200;
        res.set_content(result.dump(), "application/json");
    }

    static pqxx::result GetPreorders(const std::string& user_id, Database& db) {
        std::string query = "SELECT * FROM Users.Preorders WHERE user_id = $1";
        std::vector<std::string> params = {user_id};
        pqxx::result response = db.executeQueryWithParams(query, params);

        return response;
    }
};

