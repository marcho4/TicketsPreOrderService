#include "UpdateOrganizerInfo.h"
#include "../../FormatRegexHelper/ValidDataChecker.h"

void UpdateOrganizerInfo::OrganizerPersonalInfoUpdateRequest(const httplib::Request& req, httplib::Response& res,
                                   Database& db) {
    auto parsed = json::parse(req.body);
    std::string organization_name = parsed["organization_name"];
    std::string tin = parsed["tin"];
    std::string email = parsed["email"];
    std::string phone_number = parsed["birthday"];

    if (!DataCheker::isValidPhoneNumber(phone_number)) { // проверка на валидность номера телефона
        res.status = 400;
        res.set_content(R"({"status": "bad request", "error": "Invalid phone number"})", "application/json");
        return;
    }

    if (!DataCheker::isValidEmailFormat(email)) { // проверка на валидность email
        res.status = 400;
        res.set_content(R"({"status": "bad request", "error": "Invalid email format"})", "application/json");
        return;
    }

    auto result = db.updateOrganizerData(email, organization_name, tin, phone_number);
    // проверка, что хоть что-то было изменено
    if (result.affected_rows() == 0) {
        res.status = 404;
        res.set_content(R"({"error": "User not found or no changes made."})", "application/json");
    } else {
        res.status = 200;
        res.set_content(R"({"status": "User info updated successfully."})", "application/json");
    }
    return;
}
