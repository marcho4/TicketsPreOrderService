#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "../../third_party/httplib.h"
#include "../../third_party/nlohmann/json.hpp"
#include "../postgres/PostgresProcessing.h"
#include "../utils/ValidDataChecker.h"

class CreateOrganizerInfo {
    using json = nlohmann::json;

    struct OrganizerData {
        std::string tin;
        std::string organization_name;
        std::string email;

        static OrganizerData parseFromJson(json& parsed) {
            return {parsed["tin"],
                    parsed["organization_name"],
                    parsed["email"]};
        }

        bool Validate(httplib::Response& res) const {
            if (email.empty() || organization_name.empty() || tin.empty()) {
                spdlog::error("Пропущены обязательные поля");
                sendError(res, 400, "Empty fields");
                return false;
            }
            if (!DataCheker::isValidEmailFormat(email)) {
                spdlog::error("Неверный формат email, отказано в создании");
                sendError(res, 400, "Invalid email format");
                return false;
            }
            return true;
        }
    };

public:
    static void OrganizerPersonalInfoCreateRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);

    static bool CheckOrganizerExistence(std::string& organizer_id, Database &db);

    static bool validateRequiredFields(const json& parsed, const std::vector<std::string>& required_fields,
                                httplib::Response& res);

    static void sendError(httplib::Response& res, int status, const std::string& message);
};
