#include "UserPersonal_InfoUpdate.h"
#include "../FormatRegexHelper/ValidDataChecker.h"

void UserPersonal_InfoUpdate::UserPersonalInfoUpdateRequest(const httplib::Request& req, httplib::Response& res,
                                   Database& db) {
    auto parsed = json::parse(req.body);
    std::string email = parsed["email"];
    std::string name = parsed["name"];
    std::string phone = parsed["phone"];
    std::string birthday = parsed["birthday"];

    if (!DataCheker::isValidPhoneNumber(phone)) { // проверка на валидность номера телефона
        res.status = 400;
        res.set_content(R"({"status": "bad request", "error": "Invalid phone number"})", "application/json");
        return;
    }

    auto result = db.updateUserData(email, name, phone, birthday);
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
