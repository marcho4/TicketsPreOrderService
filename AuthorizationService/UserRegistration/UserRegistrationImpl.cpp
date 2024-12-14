#include "UserRegistrationImpl.h"
#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"

void UserRegistration::RegisterUserRequest(const httplib::Request& request,
                                           httplib::Response &res, Database& db) {
    auto parsed = json::parse(request.body);
    std::string name = parsed["name"];
    std::string last_name = parsed["last_name"];
    std::string email = parsed["email"];
    if (!AuxiliaryFunctions::isValidEmail(email)) {
        res.status = 400;
        res.set_content(R"({"status": "bad request"})", "application/json");
        return;
    }
    res.set_content("User registered", "text/plain");
    RegisterUser(email, name, last_name, db);
}

void UserRegistration::RegisterUser(const std::string& email, const std::string& name,
                           const std::string& last_name, Database& db) {
    // нужно отправить запрос в микросервис пользователя и положить данные
//    std::string request = "INSERT INTO UserService.UserData (name, last_name, auth_token) VALUES "
//                              "('" + name + "', '" + last_name + "', '" + email + "');";
}
