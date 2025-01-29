#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "../ErrorHandler.h"
#include "../postgres/PostgresProcessing.h"

class GetRequests {
    using json = nlohmann::json;

    pqxx::result GetListSQL(Database& db) {
        std::string query = "SELECT request_id, company, email, tin FROM Organizers.OrganizerRequests WHERE status = $1";
        std::vector<std::string> params = {"PENDING"};
        pqxx::result response = db.executeQueryWithParams(query, params);
        return response;
    }

    json GetListJSON(pqxx::result& response) {
        json json_body = json::array();

        for (const auto& row : response) {
            json request;
            request["request_id"] = row["request_id"].as<std::string>();
            request["company"] = row["company"].as<std::string>();
            request["email"] = row["email"].as<std::string>();
            request["tin"] = row["tin"].as<std::string>();
            json_body.push_back(request);
        }
    }

public:
    static void GetOrganizersRequestList(const httplib::Request& req, httplib::Response& res, Database& db);
};

class AddRequest {
    using json = nlohmann::json;

    struct AdminData {
        std::string company;
        std::string email;
        std::string tin;

        static AdminData GetAdminDataFromRequest(const httplib::Request& req) {
            auto parsed = json::parse(req.body);

            return {parsed["company"], parsed["email"], parsed["tin"]};
        }
    };

    bool CheckOrganizerExistence(AdminData& admin_data, Database& db) {
        std::string query = "SELECT * FROM Organizers.OrganizerRequests WHERE email = $2";
        std::vector<std::string> params = { admin_data.email};

        pqxx::result response = db.executeQueryWithParams(query, params);

        return !response.empty();
    }

    void AddOrganizerRequestToDB(AdminData& admin_data, Database& db) {
        std::string query = "INSERT INTO Organizers.OrganizerRequests (company, email, tin, status) VALUES ($1, $2, $3, $4)";
        std::vector<std::string> params = {admin_data.company, admin_data.email, admin_data.tin, "PENDING"};

        db.executeQueryWithParams(query, params);
    }

public:
    static void AddOrganizerRequest(const httplib::Request& req, httplib::Response& res, Database& db);
};

class ProcessRequest {
    using json = nlohmann::json;

    struct OrganizerData {
        std::string company;
        std::string email;
        std::string tin;

        static OrganizerData getRegistrationData(pqxx::result& data) {
            return {data[0]["company"].as<std::string>(),
                    data[0]["email"].as<std::string>(),
                    data[0]["tin"].as<std::string>()};
        }
    };

    void ApproveQuery(std::string& request_id, Database& db) {
        std::string update_query = "UPDATE Organizers.OrganizerRequests SET status = $1 WHERE request_id = $2";
        std::vector<std::string> params = {"APPROVED", request_id};
        db.executeQueryWithParams(update_query, params);
    }

    void RejectQuery(std::string& request_id, Database& db) {
        std::string update_query = "UPDATE Organizers.OrganizerRequests SET status = $1 WHERE request_id = $2";
        std::vector<std::string> params = {"REJECTED", request_id};
        db.executeQueryWithParams(update_query, params);
    }

public:
    static void ProcessOrganizerRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    pqxx::result GetPersonalData(const std::string& request_id, Database& db);
};

