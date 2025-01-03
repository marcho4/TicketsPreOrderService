#include "OrganizerRegistrationImpl.h"
#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"

void OrganizerRegistration::RegisterOrganizerRequest(const httplib::Request& request,
                                                     httplib::Response &res, Database& db) {
    auto parsed = json::parse(request.body);
    std::string email_ = parsed["email"];
    std::string company_ = parsed["company"];
    std::string tin_ = parsed["tin"]; // ввод ИНН (чтобы не забыть)
    if (!AuxiliaryFunctions::isValidEmail(email_)) {
        res.status = 400;
        res.set_content(R"({"status": "bad request"})", "application/json");
        return;
    }
    json response = {
            {"status", "waiting_approval"}
    };
    res.set_content(response.dump(), "application/json");
    RegisterOrganizer(email_, company_, company_, db);
}

void OrganizerRegistration::RegisterOrganizer(const std::string& email, const std::string& company,
                           const std::string& tin, Database& db) {
    // отправляем запрос в сервис админа для подтверждения
    // далее при одобрении высылаем логин и пароль
    // отправляем заявку на становление организатором
    nlohmann::json json_data = {
            {"email", email},
            {"company", company},
            {"TIN", tin},
            {"status", Status::AWAITS}
    };
    httplib::Client orchestrator("bla-bla-bla.com"); // пока заглушка
    auto result = orchestrator.Post("register_organizer_approval", json_data.dump(), "application/json");
}

void OrganizerRegistration::OrganizerRegisterApproval(const httplib::Request& request, httplib::Response &res, Database& db) {
    auto parsed = json::parse(request.body);
    std::string email_ = parsed["email"];
    std::string company_ = parsed["company"];
    std::string tin_ = parsed["TIN"];
    Status status = parsed["status"];
    if (status == Status::APPROVED) {
        //  генерируем логин пароль и закидываем в бд
        //  отправляем http запрос в сервис уведомления для уведомления организатора
    } else {
        // отправить сообщение об отказе
    }
}