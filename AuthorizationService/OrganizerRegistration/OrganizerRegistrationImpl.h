#include <iostream>
#include "../../libraries/json/include/nlohmann/json.hpp"
#include "../../libraries/httplib.h"

class OrganizerRegistration {
    using json = nlohmann::json;

public:
    static void HttpRegisterOrganizer(const httplib::Request& request, httplib::Response &res);

    static void RegisterOrganizer(const std::string& email, const std::string& password,
                           const std::string& company);
};

