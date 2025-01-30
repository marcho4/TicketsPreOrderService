#include <iostream>
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "../../../libraries/httplib.h"
#include "../../ErrorHandler.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "../../postgres/PostgresProcessing.h"
#include "../../utils/ValidDataChecker.h"

class AccountUpdator {
    using json = nlohmann::json;

    struct UserData {
        std::string name;
        std::string last_name;
        std::string email;
        std::string phone_number;
        std::string birthday;

        static UserData GetUserDataFromJSON(const json& parsed) {
            return {parsed.at("name").get<std::string>(),
                    parsed.at("last_name").get<std::string>(),
                    parsed.at("email").get<std::string>(),
                    parsed.at("phone_number").get<std::string>(),
                    parsed.at("birthday").get<std::string>()};
        }
    };

    static pqxx::result UpdateUserAccountDB(const UserData& user_data, const std::string& user_id, Database& db) {
        std::string update_query = "UPDATE Users.UsersData SET name = $1, last_name = $2, email = $3, "
                                   "phone = $4, birthday = $5, updated_at = CURRENT_TIMESTAMP WHERE user_id = $6";

        std::vector<std::string> params = {user_data.name, user_data.last_name, user_data.email,
                                           user_data.phone_number, user_data.birthday, user_id};
        pqxx::result response = db.executeQueryWithParams(update_query, params);

        return response;
    }

public:
    static void UpdateUserAccountRequest(const httplib::Request& req, httplib::Response& res, Database& db);
};

class Validator {
    using json = nlohmann::json;

    static bool CheckUserExistence(const std::string& user_id, Database& db) {
        std::string query = "SELECT email FROM Users.UsersData WHERE user_id = $1";
        std::vector<std::string> params = {user_id};
        pqxx::result response = db.executeQueryWithParams(query, params);
        return !response.empty();
    }

public:
    static bool Validate(const std::string& user_id, const json& parsed, httplib::Response& response, Database& db) {
        std::string email = parsed["email"];
        std::string phone_number = parsed["phone_number"];

        if (!DataCheker::isValidEmailFormat(email)) {
            ErrorHandler::sendError(response, 400, "Invalid email format");
            spdlog::error("Пользователь {} ввел неверный формат email, отказано в обновлении профиля", user_id);
            return false;
        }

        if (!DataCheker::isValidPhoneNumber(phone_number)) {
            ErrorHandler::sendError(response, 400, "Invalid phone number");
            spdlog::error("Пользователь {} ввел неверный формат номера телефона, отказано в обновлении профиля", user_id);
            return false;
        }

        if (!CheckUserExistence(user_id, db)) {
            ErrorHandler::sendError(response, 404, "User not found");
            spdlog::error("Пользователь {} не найден, отказано в обновлении профиля", user_id);
            return false;
        }

        return true;
    }
};