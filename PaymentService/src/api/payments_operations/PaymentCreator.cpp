#include "PaymentCreator.h"

void PaymentCreator::CreatePaymentRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    json body = json::parse(req.body);

    PaymentData payment_data = PaymentData::GetPaymentData(body);
    spdlog::info("Пользователь {} создает платеж на сумму {} {}", payment_data.user_id, payment_data.amount, payment_data.currency);

//    std::string provider_id = GetProviderID(payment_data.provider, db);
    std::string provider_id = "2145d8b2-5c19-47b3-b1b9-4b53dfe08738";

    std::string payment_id = CreatePayment(payment_data, provider_id, db);

    std::string payment_url = SendPaymentRequest(payment_data, payment_id);

    res.status = 201;
    spdlog::info("Платеж {} создан", payment_id);

    json response = {
            {"message", "Payment created"},
            {"payment_id", payment_id},
            {"payment_url", payment_url}
    };
    res.set_content(response.dump(), "application/json");
}

std::string PaymentCreator::GetProviderID(const std::string &provider, Database &db) {
    std::string query = "SELECT provider_id FROM PaymentsSchema.Providers WHERE provider_name = $1";
    std::vector<std::string> params = {provider};

    pqxx::result response = db.executeQueryWithParams(query, params);

    return response[0][0].c_str();
}

std::string PaymentCreator::CreatePayment(const PaymentCreator::PaymentData &payment_data, const std::string &provider_id,
                                   Database &db) {
    std::string query = "INSERT INTO PaymentsSchema.Payments (user_id, amount, currency, provider_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING payment_id";
    std::vector<std::string> params = {payment_data.user_id, payment_data.amount,
                                       payment_data.currency,  "2145d8b2-5c19-47b3-b1b9-4b53dfe08738", "pending"};

    pqxx::result id = db.executeQueryWithParams(query, params);

    return id[0][0].as<std::string>();
}

std::string PaymentCreator::SendPaymentRequest(const PaymentCreator::PaymentData &payment_data,
                                               const std::string &payment_id) {
    httplib::Client payment_service("http://localhost:8009");
    payment_service.set_default_headers({
            {"Content-Type", "application/json"},
            {"Accept", "application/json"}
    });

    json mock_payment_data = {
            {"payment_id", payment_id},
            {"callback_url", "http://localhost:8008"}
    };
    auto response = payment_service.Post("/payments/create", mock_payment_data.dump(), "application/json");

    if (response && response->status == 200) {
        json response_from_server = json::parse(response->body);
        return response_from_server["payment_url"];
    }
    return "SHIT HAPPENS";
}