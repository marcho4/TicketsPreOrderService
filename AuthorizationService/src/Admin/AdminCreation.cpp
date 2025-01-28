#include "AdminCreation.h"

void AdminCreation::CreateAdminRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    auto parsed = json::parse(req.body);
    std::vector<std::string> required_fields = {"api_key", "login", "password", "email"};

    if (!ValidateAdminData(parsed, required_fields)) {
        ErrorHandler::sendError(res, 400, "Missing required fields");
    }

    AdminData admin_data = AdminData::getAdminData(parsed);

    if (!ValidateApiKey(admin_data.api_key)) {
        ErrorHandler::sendError(res, 403, "Invalid api_key");
    }

    std::string hashed_password = bcrypt::generateHash(admin_data.password);
    std::vector<std::string> params = {admin_data.login, hashed_password, admin_data.email, "ADMIN"};

    try {
        createAdmin(admin_data, db);
    } catch (const std::exception& e) {
        ErrorHandler::sendError(res, 409, "User already exists");
    }
    res.status = 200;
    res.set_content(R"({"message": "Successfully created"})", "application/json");
}

bool AdminCreation::ValidateAdminData(const AdminCreation::json &parsed, std::vector<std::string> required_field) {
    for (const auto& field : required_field) {
        if (parsed.find(field) == parsed.end()) {
            return false;
        }
    }
    return true;
}

// TODO: дописать функцию
bool AdminCreation::ValidateApiKey(const std::string& api_key) {
    // вытянуть реальный апи ключ
    // проверить валидность
    return true;
}
