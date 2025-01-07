#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include <pqxx/pqxx>
#include "../postgres/PostgresProcessing.h"
#include "../../libraries/Bcrypt.cpp/include/bcrypt.h"
class AuthorizationManager {
    using json = nlohmann::json;

public:
    static void AuthorizationRequest(const httplib::Request& req, httplib::Response& res,
                              Database& db);

    static bool validatePassword(const std::string& password, const std::string& hashed_password);
};
