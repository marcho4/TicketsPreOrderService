#include <iostream>
#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"

class UserRegistration {
    using json = nlohmann::json;

public:
    static void RegisterUserRequest(const httplib::Request& request, httplib::Response &res);

    static void RegisterUser(const std::string& email, const std::string& password,
                           const std::string& company);
};

