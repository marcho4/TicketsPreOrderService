#include "AuthorizationManager.h"

void AuthorizationManager::AuthorizationRequest(const httplib::Request& req, httplib::Response& res,
                              Database& db) {
    int id = std::stoi(req.matches[1]);

    auto parsed = json::parse(req.body);
    std::string login = parsed["login"];
    std::string password = parsed["password"];
    pqxx::result password_hash;

    try {
        std::string query = "SELECT password FROM AuthorizationService.AuthorizationData WHERE id = $1";
        password_hash = db.executeQueryWithParams(query, id);
    } catch (const std::exception& e) {
        res.status = 500;
        res.set_content(R"({"status": "Server error"})", "application/json");
        return;
    }

    if (password_hash.empty()) { // проверка на существование пользователя
        res.status = 403; // 403 - forbidden
        res.set_content(R"({"status": "Access denied"})", "application/json");
        return;
    }

    if (!validatePassword(password, password_hash[0][0].c_str())) { // проверка на корректность пароля
        res.status = 403;
        res.set_content(R"({"status": "Access denied"})", "application/json");
        return;
    }
}

bool AuthorizationManager::validatePassword(const std::string& password, const std::string& hashed_password) {
    return bcrypt::validatePassword(password, hashed_password);
}