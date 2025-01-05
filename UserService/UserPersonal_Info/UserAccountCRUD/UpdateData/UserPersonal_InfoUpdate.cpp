#include "UserPersonal_InfoUpdate.h"
#include "../../FormatRegexHelper/ValidDataChecker.h"

// /user/{id}/update_personal_info - обновление данных пользователя
void UserPersonal_InfoUpdate::UserPersonalInfoUpdateRequest(const httplib::Request& req, httplib::Response& res,
                                   Database& db) {
    int user_id = std::stoi(req.matches[1]);
    auto parsed = json::parse(req.body);
    std::string email = parsed["email"];
    std::string name = parsed["name"];
    std::string phone = parsed["phone"];
    std::string birthday = parsed["birthday"];

    if (!creator.CheckUserExistence(user_id, db)) { // проверка на существование пользователя
        res.status = 404;
        res.set_content(R"({"status": "not found", "error": "User with this email not found"})", "application/json");
        return;
    }

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
