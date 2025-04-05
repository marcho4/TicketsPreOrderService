#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include <unordered_map>
#include <thread>

class PaymentWorker {
    using json = nlohmann::json;
    static std::unordered_map<std::string, std::string> payments;

public:
    void PaymentRequest(const httplib::Request& request, httplib::Response& response);

    void SimulatePaymentProcessing(const std::string& payment_id);
};
