#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/rotating_file_sink.h"

class PaymentCreator {
    using json = nlohmann::json;

    struct PaymentData {
        std::string user_id;
        std::string amount;
        std::string currency;
        std::string provider;

        static PaymentData GetPaymentData(const json& json) {
            return {
                json.at("user_id").get<std::string>(),
                json.at("amount").get<std::string>(),
                json.at("currency").get<std::string>(),
                json.at("provider").get<std::string>()
            };
        }
    };

    std::string GetProviderID(const std::string& provider, Database& db);

    std::string CreatePayment(const PaymentData& payment_data, const std::string& provider_id, Database& db);

    std::string SendPaymentRequest(const PaymentData& payment_data, const std::string& payment_id);
public:
    void CreatePaymentRequest(const httplib::Request& req, httplib::Response& res, Database& db);
};


