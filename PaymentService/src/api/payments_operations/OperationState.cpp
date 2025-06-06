#include "OperationState.h"

std::string OperationState::GetOperationStatus(const std::string &payment_id,
                                               const std::string& operation_type, Database &db) {
    std::vector<std::string> params = {payment_id};

    if (operation_type == "PAYMENT") {
        std::string query = "SELECT status FROM PaymentsSchema.Payments WHERE payment_id = $1";
        auto result = db.executeQueryWithParams(query, params);
        return result[0][0].as<std::string>();
    }
    std::string query = "SELECT status FROM PaymentsSchema.Refunds WHERE payment_id = $1";
    auto result = db.executeQueryWithParams(query, params);
    return result[0][0].as<std::string>();
}

void OperationState::GetOperationStatusRequest(const httplib::Request &req, httplib::Response &res, Database &db) {
    if (req.path_params.at("id").empty()) {
        ErrorHandler::sendError(res, 400, "operation_id is required");
        return;
    }
    std::string payment_id = req.path_params.at("id");
    spdlog::info("Запрошена информация о статусе операции {}", payment_id);

    auto parsed = json::parse(req.body);
    if (!parsed.contains("operation_type") || !parsed["operation_type"].is_string()) {
        spdlog::error("Ошибка: отсутствует operation_type или неверный формат");
        ErrorHandler::sendError(res, 400, "operation_type is required and must be a string");
        return;
    }

    std::string operation_type = parsed["operation_type"];

    std::string status = GetOperationStatus(payment_id, operation_type, db);

    json response = {
        {"status", status},
        {"payment_id", payment_id}
    };
    res.status = 200;
    res.set_content(response.dump(), "application/json");
}