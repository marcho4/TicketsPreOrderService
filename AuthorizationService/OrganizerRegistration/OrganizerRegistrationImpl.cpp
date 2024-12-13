#include "OrganizerRegistrationImpl.h"
#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"

void OrganizerRegistration::HttpRegisterOrganizer(const httplib::Request& request, httplib::Response &res) {
    auto parsed = json::parse(request.body);
    std::string email_ = parsed["email"];
    std::string company_ = parsed["company"];
    std::string tin_ = parsed["TIN"]; // ввод ИНН (чтобы не забыть)
    if (!AuxiliaryFunctions::isValidEmail(email_)) {
       res.status = 400;
        res.set_content(R"({"status": "bad request"})", "application/json");
        return;
    }
    RegisterOrganizer(email_, company_, company_);
}

void OrganizerRegistration::RegisterOrganizer(const std::string& email, const std::string& company,
                           const std::string& tin) {
    // кладем данные в бд
    // отправляем заявку на становление организатором
    return;
}