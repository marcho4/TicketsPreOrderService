#include "OrganizerAuthorizationImpl.h"

void AuthorizationImpl::AuthorizationRequest(const httplib::Request& req, httplib::Response& res,
                              Database& db) {
    auto parsed = json::parse(req.body);
    std::string login = parsed["login"];
    std::string password = parsed["password"];
    std::string request = "SELECT FROM AuthorizationService.AuthorizationData "
                          "WHERE login = '" + login + "' AND password = '" + password + "';";
    pqxx::result result = db.executeQuery(request);
    if (result.empty()) {
        res.status = 403;
        res.set_content(R"({"status": "Access denied"})", "application/json");
        return;
    }
    Authorization(login, password);
}

void AuthorizationImpl::Authorization(const std::string& login, const std::string& password) {
    // генерируем и отправляем jwt-токен
}