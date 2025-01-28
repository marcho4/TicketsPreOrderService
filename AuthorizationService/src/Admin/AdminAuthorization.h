#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "../postgres/PostgresProcessing.h"


class AdminAuthorization {
    using json = nlohmann::json;

public:
    static void AuthorizeAdminRequest(httplib::Request& req, httplib::Response& res, Database& db);
};

