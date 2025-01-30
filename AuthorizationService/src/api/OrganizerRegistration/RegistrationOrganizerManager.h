#include <iostream>
#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include <pqxx/pqxx>
#include "../../postgres/PostgresProcessing.h"
#include "../../AuxiliaryFunctions/AuxiliaryFunctions.h"
#include "../../ErrorHandler.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>

class OrganizerRegistrationManager {
    using json = nlohmann::json;

    struct OrganizerDataWithStatus {
        std::string email;
        std::string company;
        std::string tin;
        std::string status;
        std::string user_id;

        static OrganizerDataWithStatus getRegistrationData(json& parsed) {
            return {parsed.at("email").get<std::string>(),
                    parsed.at("company").get<std::string>(),
                    parsed.at("tin").get<std::string>(),
                    parsed.at("status").get<std::string>(),
                    parsed.at("user_id").get<std::string>()};
        }
    };

public:
    static void RegisterOrganizerRequest(const httplib::Request& request, httplib::Response &res, Database& db);

    static void OrganizerRegisterApproval(const httplib::Request& request, httplib::Response &res, Database& db);

    static bool CheckEmailUniquenessAndOrganizerExistence(const std::string& email, Database& db);

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
            ErrorHandler::sendError(res, 400, "Fill all fields!");
            spdlog::error("Пропущены обязательные поля, отказано в регистрации");
            return false;
        }
        if (!AuxiliaryFunctions::isValidEmail(email)) {
            spdlog::error("Неккоректный формат email: {}, отказано в регистрации", email);
            ErrorHandler::sendError(res, 400, "Invalid email format");
        }
        if (!OrganizerRegistrationManager::checkCorrectnessTIN(tin)) {
            spdlog::error("Неккоректный формат ИНН: {}, отказано в регистрации", tin);
            ErrorHandler::sendError(res, 400, "Invalid TIN format");
            return false;
        }
        return true;
    }
};