#include "CreateOrganizerAccount.h"
#include "../FormatRegexHelper/ValidDataChecker.h"

// /create_organizer_info/{id} - запрос
void CreateOrganizerInfo::OrganizerPersonalInfoCreateRequest(const httplib::Request& req, httplib::Response& res,
                                                            Database& db) {
    std::string organizer_id;
    if (!req.path_params.at("id").empty()) {
        organizer_id = req.path_params.at("id");
    } else {
        sendError(res, 400, "Missing id parameter");
        return;
    }
    auto parsed = json::parse(req.body);
    const std::vector<std::string> required_fields = {"email", "organization_name", "tin", "phone_number"};
    for (const auto& field : required_fields) {
        if (!parsed.contains(field)) {
            sendError(res, 400, "Missing field: " + field);
            return;
        }
    }
    std::string email = parsed["email"];
    std::string organization_name = parsed["organization_name"];
    std::string tin = parsed["tin"];
    std::string phone = parsed["phone_number"];

    if (email.empty() || organization_name.empty() || tin.empty() || phone.empty()) {
        sendError(res, 400, "Empty fields");
        return;
    }

    if (!DataCheker::isValidEmailFormat(email)) { // проверка на валидность email
        sendError(res, 400, "Invalid email format");
        return;
    }

    if (!DataCheker::isValidPhoneNumber(phone)) { // проверка на валидность номера телефона
        sendError(res, 400, "Invalid phone number");
        return;
    }

    if (CheckOrganizerExistence(email, db)) { // проверка на существование пользователя
        sendError(res, 409, "User with this email already exists");
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
        res.status = 201;
        res.set_content(response.dump(), "application/json");
    } else {
        sendError(res, 500, "Failed to insert data in database");
        return;
    }
}

bool CreateOrganizerInfo::CheckOrganizerExistence(std::string& email, Database &db) {
    std::string query = "SELECT * FROM Organizers.OrganizersData WHERE email = $1";
    std::vector<std::string> params = {email};
    pqxx::result response = db.executeQueryWithParams(query, params);
    return !response.empty();
}

void CreateOrganizerInfo::sendError(httplib::Response& res, int status, const std::string& message) {
    res.status = status;
    res.set_content(R"({"message": ")" + message + R"("})", "application/json");
}