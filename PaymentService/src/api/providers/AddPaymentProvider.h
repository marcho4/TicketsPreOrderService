#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/rotating_file_sink.h"

class AddPaymentProvider {
    using json = nlohmann::json;

    struct Provider {
        std::string provider_name;
        std::string provider_description;

        static Provider GetFromJson(const json& j) {
            Provider provider;
            provider.provider_name = j.at("provider_name").get<std::string>();
            provider.provider_description = j.at("provider_description").get<std::string>();
            return provider;
        }
    };

    static bool CheckProviderExistence(Database& db, const std::string& name);

    static std::string AddProvider(Database& db, const Provider& provider);

public:
    static void AddProviderRequest(const httplib::Request& req, httplib::Response& res, Database& db);
};


