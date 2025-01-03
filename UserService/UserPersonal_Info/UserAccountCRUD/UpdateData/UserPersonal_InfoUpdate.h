#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../../../postgres/PostgresProcessing.h"

class UserPersonal_InfoUpdate {
    using json = nlohmann::json;

public:
    void UserPersonalInfoUpdateRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);
};
