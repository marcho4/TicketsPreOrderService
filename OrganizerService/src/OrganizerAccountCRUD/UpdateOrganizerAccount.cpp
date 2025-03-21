#include "UpdateOrganizerAccount.h"

// /update_organizer_info/{id} - запрос

void UpdateOrganizerInfo::OrganizerPersonalInfoUpdateRequest(const httplib::Request& req, httplib::Response& res,
                                   Database& db) {
    std::string organizer_id;
    if (!req.path_params.at("id").empty()) {
        organizer_id = req.path_params.at("id");
    } else {
        spdlog::error("Не указан id организатора, отказано в обновлении");
        sendError(res, 400, "Missing id parameter");
        return;
    }

    auto parsed = json::parse(req.body);

    std::string error_message;
    if (!Validator::Validate(parsed, error_message)) {
        sendError(res, 400, error_message);
        return;
    }

    OrganizerData organizer_data = OrganizerData::parseFromJson(parsed);

    if (CheckEmailUnique(organizer_data.email, organizer_id, db)) {
        spdlog::error("Пользователь с email: {} уже существует, отказано в обновлении", organizer_data.email);
        sendError(res, 409, "User with this email already exists");
        return;
    }
    // формируем запрос и подготовленные данные
    std::string update_query = "UPDATE Organizers.OrganizersData "
                               "SET organization_name = $1, email = $2, phone_number = $3, updated_at = CURRENT_TIMESTAMP "
                               "WHERE organizer_id = $4";
    std::vector<std::string> data = {organizer_data.organization_name,
                                     organizer_data.email, organizer_data.phone_number, organizer_id};
    pqxx::result response = db.executeQueryWithParams(update_query, data);
    // проверка, что хоть что-то было изменено
    if (response.affected_rows() == 0) {
        spdlog::error("Пользователь с id {} не найден или изменения не были внесены", organizer_id);
        sendError(res, 404, "User not found or no changes made.");
    } else {
        spdlog::info("Данные пользователя с id {} успешно обновлены", organizer_id);
        res.status = 201;
        res.set_content(R"({"message": "User info updated successfully."})", "application/json");
    }
}

bool UpdateOrganizerInfo::CheckEmailUnique(const std::string &email, const std::string& organizer_id, Database &db) {
    std::string check_email = "SELECT * FROM Organizers.OrganizersData WHERE email = $1 AND organizer_id != $2";
    std::vector<std::string> data = {email, organizer_id};
    pqxx::result response = db.executeQueryWithParams(check_email, data);
    return !response.empty();
}

void UpdateOrganizerInfo::sendError(httplib::Response& res, int status, const std::string& message) {
    res.status = status;
    res.set_content(R"({"message": ")" + message + R"("})", "application/json");
}
