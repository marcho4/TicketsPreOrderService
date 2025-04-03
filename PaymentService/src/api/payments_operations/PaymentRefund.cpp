#include "PaymentRefund.h"

std::pair<std::string, std::string> PaymentRefund::GetResponseDataFromDB(const std::string& payment_id, Database& db) {
    std::string query = "SELECT match_id, ticket_id FROM PaymentsSchema.Payments WHERE payment_id = $1";
    std::vector<std::string> params = {payment_id};

    pqxx::result result = db.executeQueryWithParams(query, params);

    return {result[0][0].as<std::string>(), result[0][1].as<std::string>()};
}

bool PaymentRefund::CheckPaymentExistence(const std::string &payment_id, Database &db) {
    std::string query = "SELECT 1 FROM PaymentsSchema.Payments WHERE payment_id = $1";
    std::vector<std::string> params = {payment_id};

    return !db.executeQueryWithParams(query, params).empty();
}

void PaymentRefund::RefundRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    if (req.path_params.at("id").empty()) {
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }

    std::string payment_id = req.path_params.at("id");

    if (!CheckPaymentExistence(payment_id, db)) {
        ErrorHandler::sendError(res, 404, "Payment with this id does not exist");
        return;
    }

    auto [match_id, ticket_id] = GetResponseDataFromDB(payment_id, db);
    AddRefund(payment_id, db);

    res.status = 200;
    json response = {
            {"message", "Refund added successfully"},
            {"data", {
                 {"match_id", match_id},
                 {"ticket_id", ticket_id}
            }}
    };
    res.set_content(response.dump(), "application/json");
}

void PaymentRefund::AddRefund(const std::string &payment_id, Database &db) {
    std::string query = "SELECT user_id FROM PaymentsSchema.Payments WHERE payment_id = $1";
    std::vector<std::string> params = {payment_id};

    pqxx::result result = db.executeQueryWithParams(query, params);

    std::string user_id = result[0][0].as<std::string>();

    query = "INSERT INTO PaymentsSchema.Refunds (payment_id, user_id, status) VALUES ($1, $2, 'pending')";
    std::vector<std::string> refund_params = {payment_id, user_id};

    db.executeQueryWithParams(query, refund_params);
}