#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../postgres/PostgresProcessing.h"
#include "../FormatRegexHelper/ValidDataChecker.h"

class CreateOrganizerInfo {
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

        bool Validate(httplib::Response& res) const {
            if (email.empty() || organization_name.empty() || tin.empty() || phone_number.empty()) {
                sendError(res, 400, "Empty fields");
                return false;
            }
            if (!DataCheker::isValidEmailFormat(email)) {
                sendError(res, 400, "Invalid email format");
                return false;
            }
            if (!DataCheker::isValidPhoneNumber(phone_number)) {
                sendError(res, 400, "Invalid phone number");
                return false;
            }
            return true;
        }
    };

public:
    void OrganizerPersonalInfoCreateRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);

    static bool CheckOrganizerExistence(std::string& organizer_id, Database &db);

    static bool validateRequiredFields(const json& parsed, const std::vector<std::string>& required_fields,
                                httplib::Response& res);

    static void sendError(httplib::Response& res, int status, const std::string& message);
};
