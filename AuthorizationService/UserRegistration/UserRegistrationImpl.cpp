#include "UserRegistrationImpl.h"
#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"

void UserRegistration::RegisterUserRequest(const httplib::Request& request, httplib::Response &res) {
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
    RegisterUser(email, name, last_name);
}

void UserRegistration::RegisterUser(const std::string& email, const std::string& name,
                           const std::string& last_name) {
    // кладем данные в бд
    // отправляем заявку на становление организатором
    return;
}
