#include "PaymentCreator.h"

void PaymentCreator::CreatePaymentRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    json body = json::parse(req.body);

    PaymentData payment_data = PaymentData::GetPaymentData(body);

    std::string provider_id = GetProviderID(payment_data.provider, db);

    std::string payment_id = CreatePayment(payment_data, provider_id, db);
    res.status = 201;
    spdlog::info("Платеж {} создан", payment_id);

    json response = {
        {"message", "Payment created"},
        {"payment_id", payment_id}
    };
    res.set_content(response.dump(), "application/json");
}

std::string PaymentCreator::GetProviderID(const std::string &provider, Database &db) {
    std::string query = "SELECT provider_id FROM Providers WHERE provider_name = $1";
    std::vector<std::string> params = {provider};

    pqxx::result response = db.executeQueryWithParams(query, params);

    return response[0][0].c_str();
}

std::string PaymentCreator::CreatePayment(const PaymentCreator::PaymentData &payment_data, const std::string &provider_id,
                                   Database &db) {
    std::string query = "INSERT INTO Payments (user_id, amount, currency, provider_id) VALUES ($1, $2, $3, $4) RETURNING payment_id";
    std::vector<std::string> params = {payment_data.user_id, payment_data.amount, payment_data.currency, provider_id};

    pqxx::result id = db.executeQueryWithParams(query, params);

    return id[0][0].c_str();
}