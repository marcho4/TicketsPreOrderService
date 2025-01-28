
#include "RegistrationOrganizerManager.h"
#include "../UserRegistration/PasswordGenerator/PasswordCreator.h"

void OrganizerRegistrationManager::RegisterOrganizerRequest(const httplib::Request& request,
                                                            httplib::Response &res, Database& db) {
    try {
        auto parsed = json::parse(request.body);

        if (!RegistrationOrganizerValidator::Validate(parsed, res)) {
            return;
        }
//        if (CheckEmailUniquenessAndOrganizerExistence(email, db)) {
//            SetErrorResponse(res, "Organizer already registered");
//            return;
//        }
        json response = {
                {"status", "Application sent to admin"}
        };
        res.status = 200;
        res.set_content(response.dump(), "application/json");
        return;
    } catch (const std::exception& e) {
        ErrorHandler::sendError(res, 400, "Invalid request format");
    }
}

// /authorize_approved - запрос, приходит от сервиса админа в случае подтверждения
void OrganizerRegistrationManager::OrganizerRegisterApproval(const httplib::Request& request,
                                                             httplib::Response &res, Database& db) {
    auto parsed = json::parse(request.body);
    OrganizerDataWithStatus data_sent_by_admin = OrganizerDataWithStatus::getRegistrationData(parsed);

    if (data_sent_by_admin.status == "APPROVED") {
        // сгенерили пароль
        LoginData data = PasswordCreator::generatePasswordAndLoginForOrganizer(data_sent_by_admin.company, db);
        // credentials[0] - пароль, credentials[1] - логин, credentials[2] - хэш пароля

        std::vector<std::string> credentials = PasswordCreator::HashAndSavePassword(data, db);
        std::string role = "ORGANIZER";
        std::string query = "INSERT INTO AuthorizationService.AuthorizationData (login, password, email, status) "
                            "VALUES ($1, $2, $3, $4) RETURNING id";
        std::vector<std::string> params = {credentials[1], credentials[2], data_sent_by_admin.email, role};
        db.executeQueryWithParams(query, params); // храним хэш пароля, а не сам пароль

        res.status = 200;
        json response_body = {
                {"login", credentials[1]},
                {"password", credentials[0]},
                {"message", "Organizer approved"},
                {"status", "success"}
        };
        res.set_content(response_body.dump(), "application/json");
    } else {
        res.status = 403;
        res.set_content(json{{"status", "rejected"}, {"message", "Registration denied"}}.dump(), "application/json");
    }
}

bool OrganizerRegistrationManager::CheckEmailUniquenessAndOrganizerExistence(const std::string &email, Database &db) {
    std::string query = "SELECT * FROM Authorization.AuthorizationData WHERE email = $1";
    std::vector<std::string> params = {email};
    pqxx::result ans = db.executeQueryWithParams(query, params);
    return ans.empty();
}

bool OrganizerRegistrationManager::checkCorrectnessTIN(const std::string& tin) {
    size_t len = tin.length();
    if (len != 12) {
        return false;
    }
    bool is_valid = std::all_of(tin.begin(), tin.end(), [](const char& symbol) {
        return std::isdigit(symbol);
    });
    return is_valid;
}