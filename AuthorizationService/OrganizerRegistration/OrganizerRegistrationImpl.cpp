#include "OrganizerRegistrationImpl.h"
#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"

void OrganizerRegistration::RegisterOrganizerRequest(const httplib::Request& request,
                                                     httplib::Response &res, Database& db) {
    auto parsed = json::parse(request.body);
    std::string email_ = parsed["email"];
    std::string company_ = parsed["company"];
    std::string tin_ = parsed["TIN"]; // ввод ИНН (чтобы не забыть)
    if (!AuxiliaryFunctions::isValidEmail(email_)) {
        res.status = 400;
        res.set_content(R"({"status": "bad request"})", "application/json");
        return;
    }
    std::cout << "Read data;\n";
    std::cout << email_ << '\n' << company_ << '\n' << tin_ << '\n';
    res.set_content("Organizer registered", "text/plain");
    RegisterOrganizer(email_, company_, company_, db);
}

void OrganizerRegistration::RegisterOrganizer(const std::string& email, const std::string& company,
                           const std::string& tin, Database& db) {
    // отправляем запрос в сервис админа для подтверждения
    // далее при одобрении высылаем логин и пароль
    // отправляем заявку на становление организатором
    return;
}
