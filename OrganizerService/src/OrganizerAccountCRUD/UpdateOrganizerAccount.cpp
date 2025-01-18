#include "UpdateOrganizerAccount.h"
#include "../FormatRegexHelper/ValidDataChecker.h"

// /update_organizer_info/{id} - запрос

void UpdateOrganizerInfo::OrganizerPersonalInfoUpdateRequest(const httplib::Request& req, httplib::Response& res,
                                   Database& db) {
    std::string organizer_id = req.get_param_value("organizer_id");
    auto parsed = json::parse(req.body);
    std::string organization_name = parsed["organization_name"];
    std::string tin = parsed["tin"];
    std::string email = parsed["email"];
    std::string phone_number = parsed["phone_number"];

    if (!DataCheker::isValidPhoneNumber(phone_number)) { // проверка на валидность номера телефона
        res.status = 400;
        res.set_content(R"({"status": "bad request", "message": "Invalid phone number"})", "application/json");
        return;
    }

    if (!DataCheker::isValidEmailFormat(email)) { // проверка на валидность email
        res.status = 400;
        res.set_content(R"({"status": "bad request", "message": "Invalid email format"})", "application/json");
        return;
    }

    // формируем запрос и подготовленные данные
    std::vector<std::string> data = {organization_name, tin, email, phone_number};
    std::string update_query = "UPDATE Organizers.OrganizersData SET organization_name = $1, tin = $2, email = $3, phone_number = $4, "
                        "updated_at = CURRENT_TIMESTAMP WHERE organizer_id = " + organizer_id;
    pqxx::result response = db.executeQueryWithParams(update_query, data);

    // проверка, что хоть что-то было изменено
    if (response.affected_rows() == 0) {
        res.status = 404;
        res.set_content(R"({"error": "User not found or no changes made."})", "application/json");
    } else {
        res.status = 200;
        res.set_content(R"({"status": "User info updated successfully."})", "application/json");
    }
}
