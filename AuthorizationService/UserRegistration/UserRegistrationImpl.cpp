#include "UserRegistrationImpl.h"
#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"
#include "../../libraries/Bcrypt.cpp/include/bcrypt.h"

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
    auto hashed = PasswordCreator::HashAndSavePassword(data, db);
}

bool UserRegistration::CheckEmailUniquenessOrExistence(const std::string &email, Database& db) {
    std::string query = "SELECT name FROM Users.UsersData WHERE email = $1"; // надо будет доработать
    pqxx::result res = db.executeQueryWithParams(query, email);
    if (!res.empty()) {
        return false;
    }
    return true;
}
