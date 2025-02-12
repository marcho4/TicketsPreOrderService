#include <iostream>
#include "../../../third_party/httplib.h"
#include "../../utils/ErrorHandler.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>

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

