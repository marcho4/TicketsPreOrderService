#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "../ErrorHandler.h"
#include "../postgres/PostgresProcessing.h"

class GetRequests {
    using json = nlohmann::json;

    static pqxx::result GetListSQL(Database& db) {
        std::string query = "SELECT request_id, company, email, tin, phone_number FROM Organizers.OrganizerRequests WHERE status = $1";
        std::string type = "PENDING";
        std::vector<std::string> params = {type};
        pqxx::result response = db.executeQueryWithParams(query, params);
        return response;
    }

    static json GetListJSON(pqxx::result& response) {
        json json_body = json::array();

        for (const auto& row : response) {
            json request;
            request["request_id"] = row["request_id"].as<std::string>();
            request["company"] = row["company"].as<std::string>();
            request["email"] = row["email"].as<std::string>();
            request["tin"] = row["tin"].as<std::string>();
            request["phone_number"] = row["phone_number"].as<std::string>();
            json_body.push_back(request);
        }
        return json_body;
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
        std::string phone_number;

        static AdminData GetAdminDataFromRequest(const httplib::Request& req) {
            auto parsed = json::parse(req.body);

            return {parsed["company"], parsed["email"], parsed["tin"], parsed["phone_number"]};
        }
    };

    static bool CheckOrganizerExistence(AdminData& admin_data, Database& db) {
        std::string query = "SELECT * FROM Organizers.OrganizerRequests WHERE email = $1";
        std::vector<std::string> params = {admin_data.email};

        pqxx::result response = db.executeQueryWithParams(query, params);

        return !response.empty();
    }

    static void AddOrganizerRequestToDB(AdminData& admin_data, Database& db) {
        std::string query = "INSERT INTO Organizers.OrganizerRequests (company, email, tin, status, phone_number) VALUES ($1, $2, $3, $4, $5)";
        std::vector<std::string> params = {admin_data.company, admin_data.email, admin_data.tin, "PENDING", admin_data.phone_number};

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
        std::string phone_number;


        static OrganizerData getRegistrationData(pqxx::result& data) {
            return {
                data[0]["company"].as<std::string>(),
                data[0]["email"].as<std::string>(),
                data[0]["tin"].as<std::string>(),
                data[0]["phone_number"].as<std::string>()
            };
        }
    };

    static void ApproveQuery(std::string& request_id, Database& db) {
        std::string update_query = "UPDATE Organizers.OrganizerRequests SET status = $1 WHERE request_id = $2";
        std::vector<std::string> params = {"APPROVED", request_id};
        db.executeQueryWithParams(update_query, params);
    }

    static void RejectQuery(std::string& request_id, Database& db) {
        std::string update_query = "UPDATE Organizers.OrganizerRequests SET status = $1 WHERE request_id = $2";
        std::vector<std::string> params = {"REJECTED", request_id};
        db.executeQueryWithParams(update_query, params);
    }

public:
    static void ProcessOrganizerRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static pqxx::result GetPersonalData(const std::string& request_id, Database& db);
};

