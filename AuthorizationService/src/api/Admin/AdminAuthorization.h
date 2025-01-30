#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "../../postgres/PostgresProcessing.h"
#include "../../ErrorHandler.h"
#include "bcrypt.h"

class AdminAuthorization {
    using json = nlohmann::json;

    struct AdminData {
        std::string api_key;
        std::string login;
        std::string password;
        std::string email;

        static AdminData getAdminData(json& parsed) {
            return {parsed.at("api_key").get<std::string>(),
                    parsed.at("login").get<std::string>(),
                    parsed.at("password").get<std::string>(),
                    parsed.at("email").get<std::string>()};
        }
    };

public:
    static void AuthorizeAdminRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static bool ValidateApiKey(const std::string& api_key);

    static bool ValidateLoginAndPassword(const std::string& id, Database& db, AdminData& admin_data);
};

