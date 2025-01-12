#include <iostream>
#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "../postgres/PostgresProcessing.h"
#include "PasswordGenerator/PasswordCreator.h"

class UserRegistration {
    using json = nlohmann::json;
    PasswordCreator creator;

public:
    static void RegisterUserRequest(const httplib::Request& request,
                                    httplib::Response &res, Database& db);

    static std::string RegisterUser(const std::string& email, const std::string& password,
                             const std::string& company, Database& db);

    static bool CheckEmailUniquenessOrUserExistence(const std::string& email, Database& db);
};

