#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include <pqxx/pqxx>
#include "../../postgres/PostgresProcessing.h"
#include "bcrypt.h"
#include "../../ErrorHandler.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>

class AuthorizationManager {
    using json = nlohmann::json;

    struct LoginData {
        std::string login;
        std::string password;

        static LoginData parseFromJson(json& parsed) {
            return {parsed["login"],
                    parsed["password"]};
        }
    };

public:
    static void AuthorizationRequest(const httplib::Request& req, httplib::Response& res,
                              Database& db);

    static bool validatePassword(const std::string& password, const std::string& hashed_password);

    static std::pair<std::string, std::string> getId(std::string basicString, Database &database);

    static pqxx::result getPasswordHash(std::string basicString, Database &database);
};

class ValidateLoginData {
    using json = nlohmann::json;

    struct LoginData {
        std::string login;
        std::string password;

        static LoginData parseFromJson(json& parsed) {
            return {parsed["login"],
                    parsed["password"]};
        }
    };

public:
    static bool Validate(json& parsed, httplib::Response &res, Database& db) {
        LoginData login_data = LoginData::parseFromJson(parsed);
        pqxx::result password_hash = AuthorizationManager::getPasswordHash(login_data.login, db);
        auto [user_id, auth_id] = AuthorizationManager::getId(login_data.login, db);

        if (password_hash.empty()) {
            ErrorHandler::sendError(res, 403, "Access denied");
            spdlog::error("Пользователь с логином {} отсутствует в БД, отказано в доступе", login_data.login);
            return false;
        }

        if (!AuthorizationManager::validatePassword(login_data.password, password_hash[0][0].c_str())) {
            ErrorHandler::sendError(res, 403, "Access denied");
            spdlog::error("Пользователь с логином {} предоставил неверный пароль, отказано в доступе", login_data.login);
            return false;
        }
        return true;
    }
};