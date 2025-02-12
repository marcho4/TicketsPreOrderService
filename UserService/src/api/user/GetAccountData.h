#include <iostream>
#include "../../../third_party/httplib.h"
#include "../../utils/ErrorHandler.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ValidDataChecker.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>

class DataProvider {
    using json = nlohmann::json;

public:
    static void GetUserAccountDataRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static bool CheckUserExistence(const std::string& id, Database& db);

    static json GetUserData(const std::string& id, Database& db);
};


