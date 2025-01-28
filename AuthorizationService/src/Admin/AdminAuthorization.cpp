#include "AdminAuthorization.h"

void AdminAuthorization::AuthorizeAdminRequest(httplib::Request& req, httplib::Response& res, Database& db) {
    auto parsed = json::parse(req.body);

    std::string admin_id;
    if (!req.path_params.at("id").empty()) {
        admin_id = req.path_params.at("id");
    } else {
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }

    AdminData admin_data = AdminData::getAdminData(parsed);

    if (!ValidateApiKey(admin_data.api_key) || !ValidateLoginAndPassword(admin_id, db, admin_data)) {
        ErrorHandler::sendError(res, 403, "Access denied");
        return;
    }

    json response = {
        {"message", "Success"},
        {"data", {
            {"id", admin_id},
            {"role", "admin"}
        }
    }};
    res.status = 200;
    res.set_content(response.dump(), "application/json");
}

bool AdminAuthorization::ValidateLoginAndPassword(const std::string& id, Database& db, AdminData& admin_data) {
    std::string query = "SELECT login, password FROM AuthorizationService.AuthorizationData WHERE id = $1";
    std::vector<std::string> params = {id};
    pqxx::result result = db.executeQueryWithParams(query, params);

    std::string password = result[0][1].c_str();
    std::string login = result[0][0].c_str();

    if (login != admin_data.login || !bcrypt::validatePassword(admin_data.password, password)) {
        return false;
    }
    return true;
}

// TODO: дописать функцию
bool AdminAuthorization::ValidateApiKey(const std::string& api_key) {
    // вытянуть реальный апи ключ
    // проверить валидность
    return true;
}

