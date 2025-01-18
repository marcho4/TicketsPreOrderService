#include "CreateOrganizerAccount.h"
#include "../FormatRegexHelper/ValidDataChecker.h"

// /create_organizer_info/{id} - запрос
void CreateOrganizerInfo::OrganizerPersonalInfoCreateRequest(const httplib::Request& req, httplib::Response& res,
                                                            Database& db) {
    std::string organizer_id = req.get_param_value("id");
    auto parsed = json::parse(req.body);
    std::string email = parsed["email"];
    std::string organization_name = parsed["organization_name"];
    std::string tin = parsed["tin"];
    std::string phone = parsed["phone_number"];

    if (email.empty() || organization_name.empty() || tin.empty() || phone.empty()) {
        res.status = 400;
        res.set_content(R"({"status": "bad request", "error": "Empty fields"})", "application/json");
        return;
    }

    if (!DataCheker::isValidEmailFormat(email)) { // проверка на валидность email
        res.status = 400;
        res.set_content(R"({"status": "bad request", "message": "Invalid email format"})", "application/json");
        return;
    }

    if (!DataCheker::isValidPhoneNumber(phone)) { // проверка на валидность номера телефона
        res.status = 400;
        res.set_content(R"({"status": "bad request", "message": "Invalid phone number"})", "application/json");
        return;
    }

    if (CheckOrganizerExistence(email, db)) { // проверка на существование пользователя
        res.status = 409;  // не уверен насчет кода статуса, выбрал 409 - конфликт
        res.set_content(R"({"status": "conflict", "message": "User with this email already exists"})", "application/json");
        return;
    }
    std::string insert_data = "INSERT INTO Organizers.OrganizersData (organization_name, tin, email, phone_number) "
                              "VALUES ($1, $2, $3, $4) RETURNING organizer_id";
    std::vector<std::string> params = {organization_name, tin, email, phone};
    pqxx::result result = db.executeQueryWithParams(insert_data, params);

    if (!result.empty() && result[0]["organizer_id"].c_str()) {
        std::string returned_id = result[0]["organizer_id"].c_str();
        json response = {
                {"status", "created"},
                {"message", "User created successfully"},
                {"organizer_id", returned_id}
        };
//        std::cout << returned_id << '\n';
        res.status = 201;
        res.set_content(response.dump(), "application/json");
    } else {
        res.status = 500;
        res.set_content(R"({"status": "error", "message": "Failed to insert data into the database"})", "application/json");
        return;
    }
}

bool CreateOrganizerInfo::CheckOrganizerExistence(std::string& email, Database &db) {
    std::string query = "SELECT * FROM Organizers.OrganizersData WHERE email = $1";
    std::vector<std::string> params = {email};
    pqxx::result response = db.executeQueryWithParams(query, params);
    return !response.empty();
}

