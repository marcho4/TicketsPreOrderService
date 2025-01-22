#include "processRequests.h"

using json = nlohmann::json;

void ProcessRequests::GetOrganizersRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    std::string query = "SELECT request_id, company, email, tin FROM Organizers.OrganizerRequests WHERE status = $1";
    pqxx::result response;

    try {
        response = db.executeQueryWithParams(query, "PENDING");
        json json_body = json::array();

        for (const auto& row : response) {
            json request;
            request["request_id"] = row["request_id"].as<std::string>();
            request["company"] = row["company"].as<std::string>();
            request["email"] = row["email"].as<std::string>();
            request["tin"] = row["tin"].as<std::string>();
            json_body.push_back(request);
        }

        res.status = 200;
        res.set_content(json_body.dump(), "application/json");
    } catch (const std::exception& e) {
        res.status = 500;
        res.set_content(json{{"status", "error"}, {"message", e.what()}}.dump(), "application/json");
    }
}

void ProcessRequests::ProcessOrganizerRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    auto parsed = json::parse(req.body);
    std::string request_id, status;
    try {
        request_id = parsed.at("request_id").get<std::string>();
        status = parsed.at("status").get<std::string>();
    } catch (const std::exception& e) {
        res.status = 400;
        res.set_content(json{{"status", "error"}, {"message", e.what()}}.dump(), "application/json");
        return;
    }
    pqxx::result data = GetPersonalData(request_id, db);
    if (data.empty()) {
        res.status = 404;
        res.set_content(json{{"status", "error"}, {"message", "Request not found"}}.dump(), "application/json");
        return;
    }
    std::string company = data[0]["company"].as<std::string>();
    std::string email = data[0]["email"].as<std::string>();
    std::string tin = data[0]["tin"].as<std::string>();

    if (status == "APPROVED") {
        json json_body = {
            {"email", email},
            {"company", company},
            {"tin", tin},
            {"status", "APPROVED"}
        };

        std::string update_query = "UPDATE Organizers.OrganizerRequests SET status = $1 WHERE request_id = $2";
        try {
            db.executeQueryWithParams(update_query, "APPROVED", request_id);
        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content(json{{"status",  "error"},
                                 {"message", e.what()}}.dump(), "application/json");
            return;
        }
    } else if (status == "REJECTED") {
        json json_body = {
            {"email", email},
            {"company", company},
            {"tin", tin},
            {"status", "REJECTED"}
        };

        // Обновление в БД статуса заявки
        std::string update_query = "UPDATE Organizers.OrganizerRequests SET status = $1 WHERE request_id = $2";
        try {
            db.executeQueryWithParams(update_query, "REJECTED", request_id);
        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content(json{{"status",  "error"},
                                 {"message", e.what()}}.dump(), "application/json");
            return;
        }

    } else {
        res.status = 400;
        res.set_content(json{{"status", "error"}, {"message", "Invalid status"}}.dump(), "application/json");
        return;
    }

    res.status = 200;
    res.set_content(json{{"status", "Response sent to auth service"}, {"data", status}}.dump(), "application/json");
}

pqxx::result ProcessRequests::GetPersonalData(const std::string& request_id, Database& db) {
    std::string query = "SELECT company, email, tin FROM Organizers.OrganizerRequests WHERE request_id = $1";
    return db.executeQueryWithParams(query, request_id);
}

void ProcessRequests::AddOrganizerRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    auto parsed = json::parse(req.body);
    std::string company = parsed.at("company").get<std::string>();
    std::string email = parsed.at("email").get<std::string>();
    std::string tin = parsed.at("tin").get<std::string>();

    std::string check_existence = "SELECT * FROM Organizers.OrganizerRequests WHERE email = $1";
    try {
        pqxx::result data = db.executeQueryWithParams(check_existence, email);
        if (!data.empty()) {
            res.status = 400;
            res.set_content(json{{"status", "error"}, {"message", "Organizer with this email already exists"}}.dump(), "application/json");
            return;
        }
    } catch (const std::exception& e) {
        res.status = 500;
        res.set_content(json{{"status", "error"}, {"message", e.what()}}.dump(), "application/json");
        return;
    }
    std::string add_organizer = "INSERT INTO Organizers.OrganizerRequests (company, email, tin, status) VALUES ($1, $2, $3, $4)";
    try {
        db.executeQueryWithParams(add_organizer, company, email, tin, "PENDING");
        res.status = 200;
        res.set_content(json{{"status", "success"}, {"message", "Organizer request added"}}.dump(), "application/json");
    } catch (const std::exception& e) {
        res.status = 500;
        res.set_content(json{{"status", "error"}, {"message", e.what()}}.dump(), "application/json");
        return;
    }
}
