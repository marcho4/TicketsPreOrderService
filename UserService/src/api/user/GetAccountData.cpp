#include "GetAccountData.h"

void DataProvider::GetUserAccountDataRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    std::string user_id;

    if (!req.path_params.at("id").empty()) {
        user_id = req.path_params.at("id");
    } else {
        spdlog::error("Пропущен параметр id, отказано в получении данных аккаунта");
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }

    if (!CheckUserExistence(user_id, db)) {
        spdlog::error("Пользователь с id: {} не найден", user_id);
        ErrorHandler::sendError(res, 404, "User not found");
        return;
    }

    json response = GetUserData(user_id, db);
    spdlog::info("Данные пользователя с id: {} отправлены", user_id);
    res.status = 200;
    res.set_content(response.dump(), "application/json");
}

bool DataProvider::CheckUserExistence(const std::string &id, Database &db) {
    std::string check_query = "SELECT * FROM Users.UsersData WHERE user_id = $1";
    std::vector<std::string> params = {id};

    pqxx::result result = db.executeQueryWithParams(check_query, params);

    return !result.empty();
}

nlohmann::json DataProvider::GetUserData(const std::string &id, Database &db) {
    std::string query = "SELECT * FROM Users.UsersData WHERE user_id = $1";
    std::vector<std::string> params = {id};

    pqxx::result result = db.executeQueryWithParams(query, params);

    nlohmann::json response = {
        {"message", "Success"},
        {"data", {
             {"id", result[0][0].c_str()},
             {"email", result[0][1].c_str()},
             {"name", result[0][2].c_str()},
             {"last_name", result[0][3].c_str()},
             {"phone", result[0][4].c_str()},
             {"birthday", result[0][5].c_str()},
             }
        }
    };
    spdlog::info("Данные пользователя с id: {} получены", id);
    return response;
}