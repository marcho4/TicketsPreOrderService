//#include "RegistrationUserManager.h"
//#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"
//
//void UserRegistration::RegisterUserRequest(const httplib::Request& request,
//                                           httplib::Response &res, Database& db) {
//    try {
//        auto parsed = json::parse(request.body);
//        std::string name = parsed["name"];
//        std::string last_name = parsed["last_name"];
//        std::string email = parsed["email"];
//
//        if (name.empty() || last_name.empty() || email.empty()) {
//            ErrorHandler::sendError(res, 400, "Empty fields");
//            return;
//        }
//        if (name.length() > 200 || last_name.length() > 200 || email.length() > 200) {
//            ErrorHandler::sendError(res, 400, "Too long fields");
//            return;
//        }
//        // нужно не забыть проверить на уникальность пользователя
//        if (!AuxiliaryFunctions::isValidEmail(email) || !CheckEmailUniquenessOrUserExistence(email, db)) {
//            ErrorHandler::sendError(res, 400, "Invalid email format or email already exists");
//            return;
//        }
//
//        // временно для тестов, потом нужно будет убрать
//        std::string password = RegisterUser(email, name, last_name, db);
//
//        res.status = 200;
//        res.set_content(R"({
//            "status": "User registered",
//            "name": ")" + name + R"(",
//            "last_name": ")" + last_name + R"(",
//            "email": ")" + email + R"(",
//            "password": ")" + password + R"("
//        })", "application/json");
//
//    } catch (const std::exception& e) {
//        res.status = 500;
//        res.set_content(R"({"status": "internal server error", "error": ")" + std::string(e.what()) + R"("})", "application/json");
//    }
//}
//
//std::string UserRegistration::RegisterUser(const std::string& email, const std::string& name,
//                           const std::string& last_name, Database& db) {
//    std::string query = "INSERT INTO AuthorizationService.TemplateUser (email, name, surname) "
//                        "VALUES ($1, $2, $3)"; // надо будет доработать
//    std::vector<std::string> params_ = {email, name, last_name};
//    db.executeQueryWithParams(query, params_);
//    LoginData data = PasswordCreator::generatePasswordAndLoginForUser(name, email, db);
//
//    // credentials[0] - пароль, credentials[1] - логин, credentials[2] - хэш пароля
//    std::vector<std::string> credentials = PasswordCreator::HashAndSavePassword(data, db);
//    std::string role = "USER";
//    query = "INSERT INTO AuthorizationService.AuthorizationData (login, password, email, status) "
//                        "VALUES ($1, $2, $3, $4)";
//    std::vector<std::string> params = {credentials[1], credentials[2], email, role};
//    db.executeQueryWithParams(query, params); // храним хэш пароля, а не сам пароль
//
//    // формируем запрос для отправки в микросервис уведомлений для последующего уведомления пользователя
//    nlohmann::json json_data = {
//            {"login", credentials[0]},
//            {"password", credentials[1]},
//            {"email", email}
//    };
//    httplib::Client email_sender("sender_domain.com"); // пока заглушка
//    auto result = email_sender.Post("/send_email", json_data.dump(), "application/json");
//    return credentials[0];
//}
//
//bool UserRegistration::CheckEmailUniquenessOrUserExistence(const std::string &email, Database& db) {
//    std::string query = "SELECT * FROM AuthorizationService.AuthorizationData WHERE email = $1"; // надо будет доработать
//    std::vector<std::string> params = {email};
//    pqxx::result res = db.executeQueryWithParams(query, params);
//    if (!res.empty()) {
//        return false;
//    }
//    query = "SELECT * FROM AuthorizationService.TemplateUser WHERE email = $1";
//    res = db.executeQueryWithParams(query, params);
//    if (!res.empty()) {
//        return false;
//    }
//    return true;
//}
