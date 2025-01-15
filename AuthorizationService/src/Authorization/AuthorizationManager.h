#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include <pqxx/pqxx>
#include "../postgres/PostgresProcessing.h"
#include "bcrypt.h"

class AuthorizationManager {
    using json = nlohmann::json;

public:
    static void AuthorizationRequest(const httplib::Request& req, httplib::Response& res,
                              Database& db);

    static bool validatePassword(const std::string& password, const std::string& hashed_password);

    static std::string getId(std::string basicString, Database &database);

    static pqxx::result getPasswordHash(std::string basicString, Database &database);
};
