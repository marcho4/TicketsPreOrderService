#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/rotating_file_sink.h"

class WebhookWorker {
    using json = nlohmann::json;

    struct WebhookData {
        std::string payment_id;
        std::string status;

        static WebhookData GetDataFromJSON(const json& json) {
            return {json.at("payment_id").get<std::string>(),
                    json.at("status").get<std::string>()};
        }
    };

    static void UpdateStatusInDatabase(const WebhookData& webhook_data, Database& db);

public:
    static void ProcessWebhookRequest(const httplib::Request& request, httplib::Response& response, Database& db);
};

