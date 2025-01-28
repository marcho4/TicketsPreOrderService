#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "../postgres/PostgresProcessing.h"
#include "../ErrorHandler.h"
#include "bcrypt.h"

class AdminCreation {
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
    static void CreateAdminRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static bool ValidateAdminData(const json& parsed, std::vector<std::string> required_field);

    static bool ValidateApiKey(const std::string& api_key);

    static pqxx::result createAdmin(const AdminData& adminData, Database& db) {
        std::string hashedPassword = bcrypt::generateHash(adminData.password);
        std::vector<std::string> params = {adminData.login, hashedPassword, adminData.email, "ADMIN"};

        std::string query = "INSERT INTO AuthorizationService.AuthorizationData (login, password, email, status) "
                            "VALUES ($1, $2, $3, $4) RETURNING id";

        return db.executeQueryWithParams(query, params);
    }
};

