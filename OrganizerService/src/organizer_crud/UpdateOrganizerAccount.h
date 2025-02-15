#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "../../third_party/httplib.h"
#include "../../third_party/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../postgres/PostgresProcessing.h"
#include "../utils/ValidDataChecker.h"

class UpdateOrganizerInfo {
    using json = nlohmann::json;

    struct OrganizerData {
        std::string organization_name;
        std::string email;
        std::string phone_number;

        static OrganizerData parseFromJson(json& parsed) {
            return {parsed["organization_name"],
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
        if (parsed["organization_name"].empty() ||
            parsed["email"].empty() || parsed["phone_number"].empty()) {
            message = "Empty fields";
            spdlog::error("Пропущены обязательные поля, пользователю отказано в обновлении");
            return false;
        }
        if (!DataCheker::isValidPhoneNumber(parsed["phone_number"])) {
            spdlog::error("Неверный формат номера телефона, пользователю отказано в обновлении");
            message = "Invalid phone number";
            return false;
        }
        if (!DataCheker::isValidEmailFormat(parsed["email"])) {
            spdlog::error("Неверный формат email, пользователю отказано в обновлении");
            message = "Invalid email format";
            return false;
        }
        return true;
    }
};
