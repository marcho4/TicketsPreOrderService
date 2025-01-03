#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../../../postgres/PostgresProcessing.h"

class UserPersonal_InfoCreate {
    using json = nlohmann::json;

public:
    void UserPersonalInfoCreateRequest(const httplib::Request& req, httplib::Response& res,
                                       Database& db);

    bool CheckUserExistence(const std::string& email, Database& db);

};
