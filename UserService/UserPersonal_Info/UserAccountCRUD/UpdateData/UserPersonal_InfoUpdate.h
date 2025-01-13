#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../../../postgres/PostgresProcessing.h"
#include "../CreateData/UserPersonal_InfoCreate.h"

class UserPersonal_InfoUpdate {
    using json = nlohmann::json;
    UserPersonal_InfoCreate creator;

public:
    void UserPersonalInfoUpdateRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);
};
