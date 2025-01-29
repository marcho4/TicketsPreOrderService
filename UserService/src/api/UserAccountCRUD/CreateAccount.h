#include <iostream>
#include "../../../libraries/httplib.h"
#include "../../ErrorHandler.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "../../postgres/PostgresProcessing.h"

class AccountCreator {
    using json = nlohmann::json;

    struct UserData {
        std::string name;
        std::string last_name;
        std::string email;

        static UserData GetUserDataFromJSON(const json& parsed) {
            return {parsed.at("name").get<std::string>(),
                    parsed.at("last_name").get<std::string>(),
                    parsed.at("email").get<std::string>()};
        }
    };

public:
    static void CreateUserAccountRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static bool CheckUserExistence(const UserData& user_data, Database& db);

    static pqxx::result UserCreatingResponseToDB(const UserData& user_data, Database& db);
};

