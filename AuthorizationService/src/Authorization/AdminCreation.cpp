#include "AdminCreation.h"

void AdminCreation::CreateAdminRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    auto parsed = json::parse(req.body);
    std::vector<std::string> required_fields = {"api_key", "login", "password"};

    if (!ValidateAdminData(parsed, required_fields)) {
        sendError(res, 400, "Missing required fields");
    }

    AdminData admin_data = AdminData::getAdminData(parsed);
}

bool AdminCreation::ValidateAdminData(const AdminCreation::json &parsed, std::vector<std::string> required_field) {
    for (const auto& field : required_field) {
        if (parsed.find(field) == parsed.end()) {
            return false;
        }
    }
    return true;
}

void AdminCreation::sendError(httplib::Response& res, int status, const std::string& message) {
    res.status = status;
    res.set_content(R"({"message": ")" + message + R"("})", "application/json");
}