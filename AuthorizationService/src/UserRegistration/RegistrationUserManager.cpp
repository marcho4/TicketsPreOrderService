#include "RegistrationUserManager.h"
#include "bcrypt.h"

void UserRegistration::RegisterUserRequest(const httplib::Request& request,
                                           httplib::Response &res, Database& db) {
    if (!Validator::ValidateData(nlohmann::json::parse(request.body), res, db)) {
        return;
    }
    auto parsed = json::parse(request.body);

    UserData user_data = UserData::getUserData(parsed);

    RegisterUser(user_data, db);

    spdlog::info("Пользователь зарегистрирован, email: {}", user_data.email);
    res.status = 200;
    res.set_content(R"({
        "status": "User registered",
        "name": ")" + user_data.name + R"(",
        "last_name": ")" + user_data.last_name + R"(",
        "email": ")" + user_data.email + R"("})", "application/json");
}

void UserRegistration::RegisterUser(UserData user_data, Database& db) {
    std::string password = user_data.password;
    std::string pass_hash = bcrypt::generateHash(password);

    std::vector<std::string> params = {user_data.login, pass_hash, user_data.email};

    pqxx::result id = SaveLoginData(user_data, params, db);

    std::string query = "INSERT INTO AuthorizationService.TemplateUser (id, name, surname, email) "
                        "VALUES ($1, $2, $3, $4)";

    std::vector<std::string> user_params = {id[0][0].c_str(), user_data.name, user_data.last_name, user_data.email};

    try {
        db.executeQueryWithParams(query, user_params);
    } catch (const std::exception& e) {
        spdlog::error("Не удалось сохранить данные пользователя");
        throw std::runtime_error("Failed to save user data");
    }
}

pqxx::result UserRegistration::SaveLoginData(UserData& user_data, std::vector<std::string>& params, Database& db) {
    std::string query = "INSERT INTO AuthorizationService.AuthorizationData (login, password, email) "
                        "VALUES ($1, $2, $3) RETURNING id";
    try {
        return db.executeQueryWithParams(query, params);
    } catch (const std::exception& e) {
        spdlog::error("Не удалось сохранить данные пользователя");
        throw std::runtime_error("Failed to save user data");
    }
}


