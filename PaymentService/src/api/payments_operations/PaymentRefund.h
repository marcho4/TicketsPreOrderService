#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/rotating_file_sink.h"

class PaymentRefund {
    using json = nlohmann::json;

    static std::pair<std::string, std::string> GetResponseDataFromDB(const std::string& payment_id, Database& db);

    static bool CheckPaymentExistence(const std::string& payment_id, Database& db);

    static void AddRefund(const std::string& payment_id, Database& db);

public:
    static void RefundRequest(const httplib::Request& req, httplib::Response& res, Database& db);
};


