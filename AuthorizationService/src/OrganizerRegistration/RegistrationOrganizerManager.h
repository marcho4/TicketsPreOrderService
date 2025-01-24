#include <iostream>
#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include <pqxx/pqxx>
#include "../postgres/PostgresProcessing.h"
#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"

class OrganizerRegistrationManager {
    using json = nlohmann::json;

    struct OrganizerDataWithStatus {
        std::string email;
        std::string company;
        std::string tin;
        std::string status;

        static OrganizerDataWithStatus getRegistrationData(json& parsed) {
            return {parsed.at("email").get<std::string>(),
                    parsed.at("company").get<std::string>(),
                    parsed.at("tin").get<std::string>(),
                    parsed.at("status").get<std::string>()};
        }
    };

public:
    static void RegisterOrganizerRequest(const httplib::Request& request, httplib::Response &res, Database& db);

    static void OrganizerRegisterApproval(const httplib::Request& request, httplib::Response &res, Database& db);

    static bool CheckEmailUniquenessAndOrganizerExistence(const std::string& email, Database& db);

    static void SetErrorResponse(httplib::Response& res, const std::string& message) {
        res.status = 400;
        res.set_content(json{{"status", "error"}, {"message", message}}.dump(), "application/json");
    }

    static bool checkCorrectnessTIN(const std::string& tin);
};

class RegistrationOrganizerValidator {
    using json = nlohmann::json;

public:

    static bool Validate(nlohmann::json& parsed, httplib::Response &res) {
        std::string email = parsed.at("email").get<std::string>();
        std::string company = parsed.at("company").get<std::string>();
        std::string tin = parsed.at("tin").get<std::string>();

        if (email.empty() || company.empty() || tin.empty()) {
            OrganizerRegistrationManager::SetErrorResponse(res, "Fill all fields!");
            return false;
        }
        if (!AuxiliaryFunctions::isValidEmail(email)) {
            OrganizerRegistrationManager::SetErrorResponse(res, "Invalid email format");
        }
        if (!OrganizerRegistrationManager::checkCorrectnessTIN(tin)) {
            OrganizerRegistrationManager::SetErrorResponse(res, "Invalid TIN format");
            return false;
        }
        return true;
    }
};