#include "RegistrationUserManager.h"
#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"

void UserRegistration::RegisterUserRequest(const httplib::Request& request,
                                           httplib::Response &res, Database& db) {
    try {
        auto parsed = json::parse(request.body);
        std::string name = parsed["name"];
        std::string last_name = parsed["last_name"];
        std::string email = parsed["email"];

        if (name.empty() || last_name.empty() || email.empty()) {
            res.status = 400;
            res.set_content(R"({"status": "fill every field!"})", "application/json");
            return;
        }

        // нужно не забыть проверить на уникальность пользователя
        if (!AuxiliaryFunctions::isValidEmail(email)) {
            res.status = 400;
            res.set_content(R"({"status": "email already exists or email invalid"})", "application/json");
            return;
        }

//        RegisterUser(email, name, last_name, db);

        res.status = 200;
        res.set_content(R"({
            "status": "User registered",
            "name": ")" + name + R"(",
            "last_name": ")" + last_name + R"(",
            "email": ")" + email + R"("
        })", "application/json");

    } catch (const std::exception& e) {
        res.status = 500;
        res.set_content(R"({"status": "internal server error", "error": ")" + std::string(e.what()) + R"("})", "application/json");
    }
}

void UserRegistration::RegisterUser(const std::string& email, const std::string& name,
                           const std::string& last_name, Database& db) {
    std::string query = "INSERT INTO Users.UsersData (email, name, last_name) "
                        "VALUES ($1, $2, $3)"; // надо будет доработать
    db.executeQueryWithParams(query, email, name, last_name);
    LoginData data = PasswordCreator::generatePasswordAndLoginForUser(email, last_name, db);
    // credentials[0] - пароль, credentials[1] - логин, credentials[2] - хэш пароля
    auto credentials = PasswordCreator::HashAndSavePassword(data, db);
    query = "INSERT INTO AuthorizationService.AuthorizationData (login, password, email) "
            "VALUES ($1, $2, $3)";
    db.executeQueryWithParams(query, credentials[1], credentials[2], email); // храним хэш пароля, а не сам пароль

    // формируем запрос для отправки в микросервис уведомлений для последующего уведомления пользователя
    nlohmann::json json_data = {
            {"login", credentials[0]},
            {"password", credentials[1]},
            {"email", email}
    };
    httplib::Client email_sender("sender_domain.com"); // пока заглушка
    auto result = email_sender.Post("/send_email", json_data.dump(), "application/json");
}

bool UserRegistration::CheckEmailUniquenessOrExistence(const std::string &email, Database& db) {
    std::string query = "SELECT name FROM Users.UsersData WHERE email = $1"; // надо будет доработать
    pqxx::result res = db.executeQueryWithParams(query, email);
    if (!res.empty()) {
        return false;
    }
    return true;
}
