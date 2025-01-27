#include "AuthorizationManager.h"

void AuthorizationManager::AuthorizationRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    auto parsed = json::parse(req.body);

    std::string user_id;
    if (!req.path_params.at("id").empty()) {
        user_id = req.path_params.at("id");
    } else {
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }

    LoginData login_data = LoginData::parseFromJson(parsed);

    if (!ValidateLoginData::Validate(parsed, res, db)) {
        return;
    }

    pqxx::result status;
    try {
        std::string status_query = "SELECT status FROM AuthorizationService.AuthorizationData WHERE id = $1";
        std::vector<std::string> params = {user_id};
        status = db.executeQueryWithParams(status_query, params);
    } catch (const std::exception& e) {
        ErrorHandler::sendError(res, 500, "Failed to get user status");
        return;
    }

    if (status.empty()) {
        ErrorHandler::sendError(res, 403, "Access denied");
        return;
    }

    std::string role = status[0][0].c_str();

    std::string response_content = R"({
    "msg": "Success",
        "data": {
            "id": ")" + user_id + R"(",
            "role": ")" + role + R"("
        }
    })";
    res.status = 200;
    res.set_content(response_content, "application/json");
}

bool AuthorizationManager::validatePassword(const std::string& password, const std::string& hashed_password) {
    return bcrypt::validatePassword(password, hashed_password);
}

std::string AuthorizationManager::getId(std::string login, Database &db) {
    try {
        std::string get_id = "SELECT id FROM AuthorizationService.AuthorizationData WHERE login = $1";
        std::vector<std::string> params = {login};
        pqxx::result user_id = db.executeQueryWithParams(get_id, params);
        if (user_id.empty()) {
            return "";
        }
        return user_id[0][0].c_str();
    } catch (const std::exception& e) {
        return "";
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
