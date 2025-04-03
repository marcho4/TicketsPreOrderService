#include "PaymentWorker.h"

void PaymentWorker::PaymentRequest(const httplib::Request& request, httplib::Response& res) {
    auto parsed = json::parse(request.body);
    std::string payment_id = parsed["payment_id"];
    payments[payment_id] = parsed["callback_url"];

    std::thread(&PaymentWorker::SimulatePaymentProcessing, this, payment_id).detach();

    res.status = 200;
    json response = {
            {"message", "Payment processed"},
            {"payment_url", "http://payment_url/" + payment_id}
    };
    res.set_content(response.dump(), "application/json");
}

void PaymentWorker::SimulatePaymentProcessing(const std::string& payment_id) {
    std::this_thread::sleep_for(std::chrono::seconds(5 + rand() % 10));

    std::string payment_status = (rand() % 100 < 90) ? "success" : "failed";

    std::string callback_url = payments[payment_id];
    httplib::Client client(callback_url);
    json response = {
            {"payment_id", payment_id},
            {"status", payment_status}
    };
    auto response_from_server = client.Post("/payments/webhook", response.dump(), "application/json");
}