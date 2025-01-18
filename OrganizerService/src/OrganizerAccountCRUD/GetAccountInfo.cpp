#include "GetAccountInfo.h"

void GetAccountInfo::GetAccountInfoRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    std::string organizer_id = req.get_param_value("id");
    pqxx::result organizer_info = getData(organizer_id, db);
    if (!CheckOrganizerExistence(organizer_id, db)) {
        res.status = 404;
        res.set_content(R"({"message": "User not found"})", "application/json");
        return;
    }
    json organizer_info_json = {
        {"organization_name", organizer_info[0][1].as<std::string>()},
        {"tin", organizer_info[0][2].as<std::string>()},
        {"email", organizer_info[0][3].as<std::string>()},
        {"phone_number", organizer_info[0][4].as<std::string>()}
    };
    res.status = 200;
    res.set_content(organizer_info_json.dump(), "application/json");
}

pqxx::result GetAccountInfo::getData(const std::string& id, Database& db) {
    std::string get_data_query = "SELECT * FROM Organizers.OrganizersData WHERE id = $1";
    std::vector<std::string> params = {id};
    pqxx::result result = db.executeQueryWithParams(get_data_query, params);
    return result;
}

bool GetAccountInfo::CheckOrganizerExistence(const std::string& id, Database& db) {
    std::string check_query = "SELECT * FROM Organizers.OrganizersData WHERE id = $1";
    std::vector<std::string> params = {id};
    pqxx::result result = db.executeQueryWithParams(check_query, params);
    return !result.empty();
}