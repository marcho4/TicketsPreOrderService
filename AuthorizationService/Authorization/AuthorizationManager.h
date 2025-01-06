#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include <pqxx/pqxx>
#include "../postgres/PostgresProcessing.h"

class AuthorizationImpl {
    using json = nlohmann::json;

public:
    static void AuthorizationRequest(const httplib::Request& req, httplib::Response& res,
                              Database& db);

    static void Authorization(const std::string& login, const std::string& password);
};
