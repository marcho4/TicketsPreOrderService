#include "AuthorizationManager.h"

void AuthorizationManager::AuthorizationRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    auto parsed = json::parse(req.body);
    std::string login = parsed["login"];
    std::string password = parsed["password"];
    pqxx::result password_hash = getPasswordHash(login, db);
    std::string user_id = getId(login, db);

    if (password_hash.empty()) {
        res.status = 403; // 403 - forbidden
        res.set_content(R"({"msg": "Access denied"})", "application/json");
        return;
    }

    if (!validatePassword(password, password_hash[0][0].c_str())) {
        res.status = 403;
        res.set_content(R"({"msg": "Access denied"})", "application/json");
        return;
    }

    pqxx::result status;
    try {
        std::string status_query = "SELECT status FROM AuthorizationService.AuthorizationData WHERE id = $1";
        status = db.executeQueryWithParams(status_query, user_id);
    } catch (const std::exception& e) {
        res.status = 500;
        res.set_content(R"({"msg": "Server error"})", "application/json");
        return;
    }

    if (status.empty()) {
        res.status = 403;
        res.set_content(R"({"msg": "Access denied"})", "application/json");
        return;
    }

    std::string role = status[0][0].c_str();
    std::string response_content = R"({
    "msg": "Success",
        "data": {
            "id": ")" + user_id + R"(",
            "role": ")" + std::string(status[0][0].c_str()) + R"("
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
        return db.executeQueryWithParams(get_id, login)[0][0].c_str();
    } catch (const std::exception& e) {
        return "";
    }
}

pqxx::result AuthorizationManager::getPasswordHash(std::string login, Database &db) {
    try {
        std::string password_query = "SELECT password FROM AuthorizationService.AuthorizationData WHERE login = $1";
        pqxx::result password_hash = db.executeQueryWithParams(password_query, login);
        return password_hash;
    } catch (const std::exception& e) {
        return {};
    }
}
