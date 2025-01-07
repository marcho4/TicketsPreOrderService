#include "UserRegistrationImpl.h"
#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"

void UserRegistration::RegisterUserRequest(const httplib::Request& request,
                                           httplib::Response &res, Database& db) {
    auto parsed = json::parse(request.body);
    std::string name = parsed["name"];
    std::string last_name = parsed["last_name"];
    std::string email = parsed["email"];
    if (!AuxiliaryFunctions::isValidEmail(email) || !CheckEmailUniquenessOrExistence(email, db)) {
        res.status = 400;
        res.set_content(R"({"status": "email already exists or email invalid"})", "application/json");
        return;
    }
    res.set_content("User registered", "text/plain");
    RegisterUser(email, name, last_name, db);
}


void UserRegistration::RegisterUser(const std::string& email, const std::string& name,
                           const std::string& last_name, Database& db) {
    std::string query = "INSERT INTO Users.UsersData (email, name, last_name) "
                        "VALUES ($1, $2, $3)"; // надо будет доработать
    db.executeQueryWithParams(query, email, name, last_name);
    LoginData data = PasswordCreator::generatePasswordAndLogin(email, last_name, db);
    // hashed[0] - пароль, hashed[1] - логин, hashed[2] - хэш пароля
    auto hashed = PasswordCreator::HashAndSavePassword(data, db);
    query = "INSERT INTO AuthorizationService.AuthorizationData (login, password, email) "
            "VALUES ($1, $2, $3)";
    db.executeQueryWithParams(query, hashed[1], hashed[2], email); // храним хэш пароля, а не сам пароль

    // формируем запрос для отправки в микросервис уведомлений для последующего уведомления пользователя
    nlohmann::json json_data = {
            {"login", hashed[0]},
            {"password", hashed[1]},
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
