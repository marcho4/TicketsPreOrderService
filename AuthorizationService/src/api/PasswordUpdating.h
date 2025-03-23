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
        std::string password;

        static AuthorizationData getAuthorizationData(const json& data) {
            AuthorizationData auth_data;
            auth_data.password = data.at("password").get<std::string>();
            return auth_data;
        }
    };

    static void UpdateDataInDatabase(const std::string& pass_hash, const std::string& user_id, Database& db) {
        std::string update_query = "UPDATE AuthorizationService.AuthorizationData "
                                   "SET password = $1 WHERE id = $2";
        std::vector<std::string> params = {pass_hash, user_id};
        db.executeQueryWithParams(update_query, params);
    }

    // static bool LoginUniquenessVerification(const std::string& id, Database& db) {
    //     std::string query = "SELECT login FROM AuthorizationService.AuthorizationData WHERE login = $1 AND id != $2";
    //     std::vector<std::string> params = {login};
    //     pqxx::result response = db.executeQueryWithParams(query, params);

    //     return response.empty();
    // }

public:
    static void UpdatePasswordRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
        auto id_it = req.path_params.find("id");
        if (id_it == req.path_params.end() || id_it->second.empty()) {
            ErrorHandler::sendError(res, 400, "Missing or empty 'id' parameter");
            return;
        }
        std::string user_id = id_it->second;


        if (req.body.empty()) {
            ErrorHandler::sendError(res, 400, "Body shoud not be empty");
            return;
        }

        AuthorizationData auth_data;

        try {
            auto parsed = json::parse(req.body);
            auth_data = AuthorizationData::getAuthorizationData(parsed);
        } catch (const nlohmann::json::parse_error &e) {
            spdlog::warn("JSON parse error: {}", e.what());
            ErrorHandler::sendError(res, 400, "Error when deserializing body into JSON. Please make it correct");
            return;
        }

        if (auth_data.password.empty()) {
            ErrorHandler::sendError(res, 400, "Password field is missing or empty");
            return;
        }

        std::cout << "user_id: " << user_id << std::endl;

        std::string pass_hash = bcrypt::generateHash(auth_data.password);
        UpdateDataInDatabase(pass_hash, user_id, db);

        spdlog::info("Пароль обновлен для пользователя с id: {}", user_id);
        res.status = 200;
        res.set_content(R"({"message": "Password updated"})", "application/json");
    }
};
