#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../postgres/PostgresProcessing.h"
#include "../FormatRegexHelper/ValidDataChecker.h"

class UpdateOrganizerInfo {
    using json = nlohmann::json;

    struct OrganizerData {
        std::string tin;
        std::string organization_name;
        std::string email;
        std::string phone_number;

        static OrganizerData parseFromJson(json& parsed) {
            return {parsed["tin"],
                    parsed["organization_name"],
                    parsed["email"],
                    parsed["phone_number"]};
        }
    };

public:
    void OrganizerPersonalInfoUpdateRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);

    static bool CheckEmailUnique(const std::string& email, const std::string& organizer_id, Database& db);

    static void sendError(httplib::Response& res, int status, const std::string& message);
};

class Validator {
    using json = nlohmann::json;

public:
    static bool Validate(const json& parsed, std::string& message) {
        if (parsed["tin"].empty() || parsed["organization_name"].empty() ||
            parsed["email"].empty() || parsed["phone_number"].empty()) {
            message = "Empty fields";
            return false;
        }
        if (!DataCheker::isValidPhoneNumber(parsed["phone_number"])) {
            message = "Invalid phone number";
            return false;
        }
        if (!DataCheker::isValidEmailFormat(parsed["email"])) {
            message = "Invalid email format";
            return false;
        }
        return true;
    }
};
