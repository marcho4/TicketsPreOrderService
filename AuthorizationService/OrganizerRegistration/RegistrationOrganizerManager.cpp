#include "RegistrationOrganizerManager.h"
#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"
#include "../UserRegistration/PasswordGenerator/PasswordCreator.h"

void OrganizerRegistrationManager::RegisterOrganizerRequest(const httplib::Request& request,
                                                            httplib::Response &res, Database& db) {
    try {
        auto parsed = json::parse(request.body);
        std::string email = parsed.at("email").get<std::string>();
        std::string company = parsed.at("company").get<std::string>();
        std::string tin = parsed.at("tin").get<std::string>();
        if (email.empty() || company.empty() || tin.empty()) {
            SetErrorResponse(res, "Fill all fields!");
            return;
        }
        if (!AuxiliaryFunctions::isValidEmail(email)) {
            SetErrorResponse(res, "Invalid email format");
            return;
        }
        if (!checkCorrectnessTIN(tin)) {
            SetErrorResponse(res, "Invalid TIN format");
            return;
        }
//        if (CheckEmailUniquenessAndOrganizerExistence(email, db)) {
//            SetErrorResponse(res, "Organizer already registered");
//            return;
//        }
        RegisterOrganizer(email, company, tin, db); // короче вот тут мы должны закидывать данные в сервис
        // админа, на подтверждение, а он в ответ будет присылать запрос подтвержден ли чел или нет
        json response = {{"status", "Application sent to admin"}}; // пока что ничего никуда не отправляется а
        // мы сразу генерируем логин/пароль для чувака и отдаем ему по почте
        res.status = 200;
        res.set_content(response.dump(), "application/json");
        return;
    } catch (const std::exception& e) {
        SetErrorResponse(res, "Invalid request format");
    }
}

void OrganizerRegistrationManager::RegisterOrganizer(const std::string& email, const std::string& company,
                                                     const std::string& tin, Database& db) {
//    nlohmann::json json_data = {
//            {"email", email},
//            {"company", company},
//            {"TIN", tin},
//    };
//    httplib::Client orchestrator("https://orchestrator-service.com");
    //    auto result = orchestrator.Post("/register_organizer_approval", json_data.dump(), "application/json");
    // тут что-то надо намутить с оркестратором
}

// /authorize_approved - запрос, приходит от сервиса админа в случае подтверждения
void OrganizerRegistrationManager::OrganizerRegisterApproval(const httplib::Request& request,
                                                             httplib::Response &res, Database& db) {
    auto parsed = json::parse(request.body);
    std::string email = parsed.at("email").get<std::string>();
    std::string company = parsed.at("company").get<std::string>();
    std::string tin = parsed.at("TIN").get<std::string>();
    // из запроса нужно как-то понять подтвердили ли организатора или нет
//    Status status = Status::APPROVED; // заглушка

    if (true) {
        // сгенерили пароль
        LoginData data = PasswordCreator::generatePasswordAndLoginForOrganizer(company, db);
        // credentials[0] - пароль, credentials[1] - логин, credentials[2] - хэш пароля
        std::vector<std::string> credentials = PasswordCreator::HashAndSavePassword(data, db);
        std::string role = "ORGANIZER";
        std::string query = "INSERT INTO AuthorizationService.AuthorizationData (login, password, email, status) "
                "VALUES ($1, $2, $3, $4)";
        db.executeQueryWithParams(query, credentials[1], credentials[2], email, role); // храним хэш пароля, а не сам пароль

        NotifyOrganizer(email, credentials[1], credentials[0]);
        res.set_content(json{{"status", "success"}, {"message", "Organizer approved"}}.dump(), "application/json");
    } else {
        res.set_content(json{{"status", "rejected"}, {"message", "Registration denied"}}.dump(), "application/json");
    }
}

bool OrganizerRegistrationManager::CheckEmailUniquenessAndOrganizerExistence(const std::string &email, Database &db) {
    std::string query = "SELECT * FROM Authorization.AuthorizationData WHERE email = $1";
    pqxx::result ans = db.executeQueryWithParams(query, email);
    return ans.empty();
}

void OrganizerRegistrationManager::NotifyOrganizer(const std::string& email, const std::string& login, const std::string& password) {
    httplib::Client notifier("https://sender-service.com");
    json payload = {
            {"email", email},
            {"login", login},
            {"password", password}
    };
    notifier.Post("/send_credentials", payload.dump(), "application/json");
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