#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "../ErrorHandler.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "../postgres/PostgresProcessing.h"
#include "bcrypt.h"

class PasswordUpdating {
    using json = nlohmann::json;

    struct AuthorizationData {
        std::string login;
        std::string password;

        static AuthorizationData getAuthorizationData(const json& data) {
            AuthorizationData auth_data;
            auth_data.login = data.at("login").get<std::string>();
            auth_data.password = data.at("password").get<std::string>();
            return auth_data;
        }
    };

    static void UpdateDataInDatabase(const std::string& login, const std::string& pass_hash, const std::string& user_id, Database& db) {
        std::string update_query = "UPDATE AuthorizationService.AuthorizationData "
                                   "SET password = $1, login = $2 WHERE id = $3";
        std::vector<std::string> params = {pass_hash, login, user_id};
        db.executeQueryWithParams(update_query, params);
    }

    static bool LoginUniquenessVerification(const std::string& login, const std::string& id, Database& db) {
        std::string query = "SELECT login FROM AuthorizationService.AuthorizationData WHERE login = $1 AND id != $2";
        std::vector<std::string> params = {login};
        pqxx::result response = db.executeQueryWithParams(query, params);

        return response.empty();
    }

public:
    static void UpdatePasswordRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
        std::string user_id;
        if (req.path_params.at("id").empty()) {
            ErrorHandler::sendError(res, 400, "Missing id parameter");
        } else {
            user_id = req.path_params.at("id");
        }

        auto parsed = json::parse(req.body);
        AuthorizationData auth_data = AuthorizationData::getAuthorizationData(parsed);

        std::cout << "user_id: " << user_id << std::endl;

        if (!LoginUniquenessVerification(auth_data.login, user_id, db)) {
            spdlog::warn("Попытка обновить пароль на уже существующий логин: {}, отказано в обновлении", auth_data.login);
            ErrorHandler::sendError(res, 409, "Login is already taken");
            return;
        }

        std::string pass_hash = bcrypt::generateHash(auth_data.password);
        UpdateDataInDatabase(auth_data.login, pass_hash, user_id, db);

        spdlog::info("Пароль обновлен для пользователя с id: {}", user_id);
        res.status = 200;
        res.set_content(R"({"message": "Password updated"})", "application/json");
    }
};
