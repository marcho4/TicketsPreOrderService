#include "RequestsHandler.h"

using json = nlohmann::json;

void GetRequests::GetOrganizersRequestList(const httplib::Request& req, httplib::Response& res, Database& db) {
    pqxx::result response = GetListSQL(db);

    json body = GetListJSON(response);

    res.status = 200;
    res.set_content(body.dump(), "application/json");
}

void ProcessRequest::ProcessOrganizerRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    auto parsed = json::parse(req.body);
    std::string request_id = parsed["request_id"];
    std::string status = parsed["status"];

    pqxx::result data = GetPersonalData(request_id, db);

    OrganizerData organizer_data = OrganizerData::getRegistrationData(data);

    if (status == "APPROVED") {
        ApproveQuery(request_id, db);
    } else if (status == "REJECTED") {
        RejectQuery(request_id, db);
    } else {
        ErrorHandler::sendError(res, 400, "Invalid status");
        return;
    }
    res.status = 200;
    res.set_content(json{{"status", "Response sent to auth service"}, {"data", status}}.dump(), "application/json");
}

pqxx::result ProcessRequest::GetPersonalData(const std::string& request_id, Database& db) {
    std::string query = "SELECT company, email, tin FROM Organizers.OrganizerRequests WHERE request_id = $1";
    std::vector<std::string> params = {request_id};
    return db.executeQueryWithParams(query, params);
}

void AddRequest::AddOrganizerRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    AdminData admin_data = AdminData::GetAdminDataFromRequest(req);

    if (CheckOrganizerExistence(admin_data, db)) {
        ErrorHandler::sendError(res, 409, "Organizer with this email already exists");
        return;
    }

    AddOrganizerRequestToDB(admin_data, db);
    res.status = 200;
    res.set_content(json{{"status", "success"}, {"message", "Organizer request added"}}.dump(), "application/json");
}