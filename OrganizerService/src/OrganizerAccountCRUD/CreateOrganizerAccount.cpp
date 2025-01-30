#include "CreateOrganizerAccount.h"

// /create_organizer_info - запрос
void CreateOrganizerInfo::OrganizerPersonalInfoCreateRequest(const httplib::Request& req, httplib::Response& res,
                                                             Database& db) {
    json parsed;
    try {
        parsed = json::parse(req.body);
    } catch (const json::parse_error& e) {
        spdlog::error("Не удалось распарсить JSON: {}", e.what());
        sendError(res, 400, "Invalid JSON format");
        return;
    }

    const std::vector<std::string> required_fields = {"email", "organization_name", "tin"};
    if (!validateRequiredFields(parsed, required_fields, res)) {
        spdlog::error("Пропущены обязательные поля, отказано в создании");
        return;
    }

    OrganizerData organizer_data = OrganizerData::parseFromJson(parsed);

    if (!organizer_data.Validate(res)) {
        return;
    }

    if (CheckOrganizerExistence(organizer_data.email, db)) { // проверка на существование пользователя
        spdlog::error("Пользователь с таким email уже существует, отказано в создании");
        sendError(res, 409, "User with this email already exists");
        return;
    }

    std::string insert_data = "INSERT INTO Organizers.OrganizersData (organization_name, tin, email, phone_number) "
                              "VALUES ($1, $2, $3, $4) RETURNING organizer_id";

    std::vector<std::string> params = {organizer_data.organization_name, organizer_data.tin,
                                       organizer_data.email, "XXXXXXXXXX"};
    pqxx::result result = db.executeQueryWithParams(insert_data, params);

    if (!result.empty() && !result[0]["organizer_id"].is_null()) {
        nlohmann::json json_response = {
                {"message", "Organizer created successfully"},
                {"status", "created"},
                {"data", {
                            {"id", result[0]["organizer_id"].as<std::string>()},
                            {"role", "ORGANIZER"}
                    }
                }
        };

        spdlog::info("Организатор с email: {} успешно создан, id организатора: {}", organizer_data.email,
                     result[0]["organizer_id"].as<std::string>());

        res.status = 201;
        res.set_content(json_response.dump(), "application/json");
    } else {
        spdlog::error("Не удалось вставить данные в базу данных");
        sendError(res, 500, "Failed to insert data into the database");
    }
}

bool CreateOrganizerInfo::validateRequiredFields(const json& parsed, const std::vector<std::string>& required_fields,
                                                 httplib::Response& res) {
    for (const auto& field : required_fields) {
        if (!parsed.contains(field)) {
            sendError(res, 400, "Missing field: " + field);
            return false;
        }
    }
    return true;
}

bool CreateOrganizerInfo::CheckOrganizerExistence(std::string& email, Database& db) {
    std::string query = "SELECT COUNT(*) FROM Organizers.OrganizersData WHERE email = $1";
    std::vector<std::string> params = {email};
    pqxx::result response = db.executeQueryWithParams(query, params);
    return !response.empty() && response[0][0].as<int>() > 0;
}

void CreateOrganizerInfo::sendError(httplib::Response& res, int status, const std::string& message) {
    res.status = status;
    res.set_content(R"({"message": ")" + message + R"("})", "application/json");
}
