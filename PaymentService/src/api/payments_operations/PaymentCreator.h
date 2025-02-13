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
            if (!json.contains("user_id") || !json.contains("amount") ||
                !json.contains("currency") || !json.contains("provider")) {
                throw std::runtime_error("Некорректный JSON: отсутствуют обязательные поля");
            }
            return {
                json.at("user_id").get<std::string>(),
                json.at("amount").get<std::string>(),
                json.at("currency").get<std::string>(),
                json.at("provider").get<std::string>()
            };
        }
    };

    static std::string GetProviderID(const std::string& provider, Database& db);

    static std::string CreatePayment(const PaymentData& payment_data, const std::string& provider_id, Database& db);

    static std::string SendPaymentRequest(const PaymentData& payment_data, const std::string& payment_id);
public:
    static void CreatePaymentRequest(const httplib::Request& req, httplib::Response& res, Database& db);
};


