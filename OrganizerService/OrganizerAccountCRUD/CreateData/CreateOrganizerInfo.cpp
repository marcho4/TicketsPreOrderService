#include "CreateOrganizerInfo.h"
#include "../../FormatRegexHelper/ValidDataChecker.h"

void CreateOrganizerInfo::OrganizerPersonalInfoCreateRequest(const httplib::Request& req, httplib::Response& res,
                                                            Database& db) {
    auto parsed = json::parse(req.body);
    std::string email = parsed["email"];
    std::string organization_name = parsed["organization_name"];
    std::string tin = parsed["tin"];
    std::string phone = parsed["phone_number"];

    if (!DataCheker::isValidEmailFormat(email)) { // проверка на валидность email
        res.status = 400;
        res.set_content(R"({"status": "bad request", "error": "Invalid email format"})", "application/json");
        return;
    }

    if (!DataCheker::isValidPhoneNumber(phone)) { // проверка на валидность номера телефона
        res.status = 400;
        res.set_content(R"({"status": "bad request", "error": "Invalid phone number"})", "application/json");
        return;
    }

    if (CheckOrganizerExistence(tin, db)) { // проверка на существование пользователя
        res.status = 409;  // не уверен насчет кода статуса, выбрал 409 - конфликт
        res.set_content(R"({"status": "conflict", "error": "User with this email already exists"})", "application/json");
        return;
    }

    db.createOrganizerData(organization_name, tin, email, phone);
    res.status = 201;
    res.set_content(R"({"status": "created", "message": "User created successfully"})", "application/json");
}

bool CreateOrganizerInfo::CheckOrganizerExistence(const std::string &tin, Database &db) {
    std::string query = "SELECT name FROM Users.UsersData WHERE email = $1";
    pqxx::result response = db.executeQueryWithParams(query, tin);
    return !response.empty();
}