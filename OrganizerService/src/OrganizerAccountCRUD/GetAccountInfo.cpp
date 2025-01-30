#include "GetAccountInfo.h"

void GetAccountInfo::GetAccountInfoRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    std::string organizer_id;
    if (!req.path_params.at("id").empty()) {
        organizer_id = req.path_params.at("id");
    } else {
        spdlog::error("Пропущен параметр id, отказано в получении информации об организаторе");
        sendError(res, 400, "Missing id parameter");
        return;
    }

    if (organizer_id.empty() || !ValidatorGetter::validateRequest(organizer_id, res, db)) {
        return;
    }

    json organizer_info_json = getOrganizerInfoJson(organizer_id, db);
    spdlog::info("Информация об организаторе с organizer_id = {} успешно отправлена", organizer_id);
    res.status = 200;
    res.set_content(organizer_info_json.dump(), "application/json");
}

nlohmann::json GetAccountInfo::getOrganizerInfoJson(const std::string& id, Database& db) {
    pqxx::result organizer_info = getData(id, db);
    if (organizer_info.empty()) {
        throw std::runtime_error("Failed to retrieve organizer data");
    }
    return {
            {"organization_name", organizer_info[0]["organization_name"].as<std::string>()},
            {"tin", organizer_info[0]["tin"].as<std::string>()},
            {"email", organizer_info[0]["email"].as<std::string>()},
            {"phone_number", organizer_info[0]["phone_number"].as<std::string>()}
    };
}

pqxx::result GetAccountInfo::getData(const std::string& id, Database& db) {
    static const std::string query = "SELECT organization_name, tin, email, phone_number FROM Organizers.OrganizersData WHERE organizer_id = $1";
    std::vector<std::string> params = {id};
    return db.executeQueryWithParams(query, params);
}

void GetAccountInfo::sendError(httplib::Response& res, int status, const std::string& message) {
    res.status = status;
    res.set_content(R"({"message": ")" + message + R"("})", "application/json");
}
