#include "AuthorizationManager.h"

void AuthorizationManager::AuthorizationRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    auto parsed = json::parse(req.body);

    LoginData login_data = LoginData::parseFromJson(parsed);
    std::cout << "login: " << login_data.login << std::endl;
    std::cout << "password: " << login_data.password << std::endl;

    if (!ValidateLoginData::Validate(parsed, res, db)) {
        return;
    }

    pqxx::result status;
    try {
        std::string status_query = "SELECT status FROM AuthorizationService.AuthorizationData WHERE login = $1";
        std::vector<std::string> params = {login_data.login};
        status = db.executeQueryWithParams(status_query, params);
    } catch (const std::exception& e) {
        ErrorHandler::sendError(res, 500, "Failed to get user status");
        spdlog::error("Не удалось получить статус пользователя");
        return;
    }

    if (status.empty()) {
        ErrorHandler::sendError(res, 403, "Access denied");
        spdlog::error("Пользователь с логином {} отсутствует в БД, отказано в доступе", login_data.login);
        return;
    }

    std::string role = status[0][0].c_str();
    auto [user_id, auth_id] = getId(login_data.login, db);

    std::string response_content = R"({
    "msg": "Success",
        "data": {
            "user_id": ")" + user_id + R"(",
            "auth_id": ")" + auth_id + R"(",
            "role": ")" + role + R"("
        }
    })";
    spdlog::info("Роль: {} успешно авторизован, id: {}", role, user_id);
    res.status = 200;
    res.set_content(response_content, "application/json");
}

bool AuthorizationManager::validatePassword(const std::string& password, const std::string& hashed_password) {
    return bcrypt::validatePassword(password, hashed_password);
}

std::pair<std::string, std::string> AuthorizationManager::getId(std::string login, Database &db) {
    try {
        std::string get_id = "SELECT user_id, id FROM AuthorizationService.AuthorizationData WHERE login = $1";
        std::vector<std::string> params = {login};
        pqxx::result user_id = db.executeQueryWithParams(get_id, params);
        if (user_id.empty()) {
            return {};
        }
        return {user_id[0][0].c_str(), user_id[0][1].c_str()};
    } catch (const std::exception& e) {
        return {};
    }
}

pqxx::result AuthorizationManager::getPasswordHash(std::string login, Database &db) {
    try {
        std::string password_query = "SELECT password FROM AuthorizationService.AuthorizationData WHERE login = $1";
        std::vector<std::string> params = {login};
        pqxx::result password_hash = db.executeQueryWithParams(password_query, params);
        return password_hash;
    } catch (const std::exception& e) {
        return {};
    }
}