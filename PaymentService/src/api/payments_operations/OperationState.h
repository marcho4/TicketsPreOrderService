#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/rotating_file_sink.h"

class OperationState {
    using json = nlohmann::json;

    static std::string GetOperationStatus(const std::string& payment_id, const std::string& operation_type, Database& db);

public:
    static void GetOperationStatusRequest(const httplib::Request& req, httplib::Response& res, Database& db);
};

