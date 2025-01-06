#include <iostream>
#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "../postgres/PostgresProcessing.h"
#include "PasswordGenetator/PasswordCreator.h"

class UserRegistration {
    using json = nlohmann::json;
    PasswordCreator creator;

public:
    static void RegisterUserRequest(const httplib::Request& request,
                                    httplib::Response &res, Database& db);

    static void RegisterUser(const std::string& email, const std::string& password,
                             const std::string& company, Database& db);

    static bool CheckEmailUniquenessOrExistence(const std::string& email, Database& db);
};

