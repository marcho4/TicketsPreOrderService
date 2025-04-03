#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/rotating_file_sink.h"

class Providers {
    using json = nlohmann::json;

    static pqxx::result GetProvidersFromDb(Database& db) {
        std::string query = "SELECT * FROM PaymentsSchema.Providers";
        std::vector<std::string> params;
        return db.executeQueryWithParams(query, params);
    }

    static json GetProvidersJsonList(const pqxx::result& providers) {
        json response = json::array();
        for (const auto& provider : providers) {
            json provider_json = {
                {"provider_id", provider[0].as<std::string>()},
                {"provider_name", provider[1].as<std::string>()},
                {"provider_description", provider[2].as<std::string>()}
            };
            response.push_back(provider_json);
        }
        return response;
    }

public:
    static void GetProvidersRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
        pqxx::result providers = GetProvidersFromDb(db);

        json response = GetProvidersJsonList(providers);

        res.status = 200;
        res.set_content(response.dump(), "application/json");
    }
};

