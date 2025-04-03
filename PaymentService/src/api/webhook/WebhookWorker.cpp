#include "WebhookWorker.h"

void WebhookWorker::UpdateStatusInDatabase(const WebhookData& webhook_data, Database& db) {
    std::string query = "UPDATE PaymentsSchema.Payments SET status = $1 WHERE payment_id = $2";

    std::vector<std::string> params = {webhook_data.status, webhook_data.payment_id};

    db.executeQueryWithParams(query, params);
}

void WebhookWorker::ProcessWebhookRequest(const httplib::Request& request, httplib::Response& response, Database& db) {
    auto parsed = json::parse(request.body);

    WebhookData webhook_data = WebhookData::GetDataFromJSON(parsed);
    spdlog::info("Получен webhook от платежной системы. ID платежа: {}. Статус: {}", webhook_data.payment_id, webhook_data.status);

    UpdateStatusInDatabase(webhook_data, db);

    json result = {
            {"message", "Payment " + webhook_data.payment_id + " " + webhook_data.status}
    };
    response.status = 200;
    response.set_content(result.dump(), "application/json");
}