#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "../postgres/PostgresProcessing.h"

class AdminCreation {
    using json = nlohmann::json;

    struct AdminData {
        std::string api_key;
        std::string login;
        std::string password;

        static AdminData getAdminData(json& parsed) {
            return {parsed.at("api_key").get<std::string>(),
                    parsed.at("login").get<std::string>(),
                    parsed.at("password").get<std::string>()};
        }
    };
public:
    static void CreateAdminRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static bool ValidateAdminData(const json& parsed, std::vector<std::string> required_field);

    static void sendError(httplib::Response& res, int status, const std::string& message);
};

