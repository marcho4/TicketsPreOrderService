#include <iostream>
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "third_party/httplib.h"
#include "src/database/Database.h"
#include "src/api/payments_operations/PaymentCreator.h"
#include "src/api/payments_operations/OperationState.h"
#include "src/api/webhook/WebhookWorker.h"
#include "src/api/providers/AddPaymentProvider.h"
#include "src/api/providers/GetProviders.h"
#include "src/api/user_payments/GetUserPayments.h"
#include "src/api/user_payments/GetUserRefunds.h"
#include "src/api/payments_operations/PaymentRefund.h"

int main() {
    auto logger = spdlog::rotating_logger_mt("file_logger", "../logs/tickets_service.log", 1048576 * 5, 3);
    logger->flush_on(spdlog::level::info);
    spdlog::set_default_logger(logger);
    spdlog::info("Логгер успешно создан!");

    try {
        httplib::Server server;

        server.Options(".*", [&](const httplib::Request& req, httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "http://localhost:8009");
            res.set_header("Access-Control-Allow-Credentials", "true");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.set_header("Content-Type", "application/json");
            res.status = 200;
        });

        auto set_cors_headers = [&](httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "http://localhost:8009");
            res.set_header("Access-Control-Allow-Credentials", "true");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.set_header("Content-Type", "application/json");
        };

        std::string connect = "dbname=payment host=payment-postgres port=5432 user=postgres password=postgres";
        Database db(connect);
        db.initDbFromFile("src/database/payment.sql");
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();

        server.Post("/payments/create", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            PaymentCreator::CreatePaymentRequest(request, res, db);
        });

        server.Post("/payments/webhook", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            WebhookWorker::ProcessWebhookRequest(request, res, db);
        });

        server.Post("/payments/:id/status", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            OperationState::GetOperationStatusRequest(request, res, db);
        });

        server.Post("/payments/:id/refund", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            PaymentRefund::RefundRequest(request, res, db);
        });

        server.Get("/user/:id/payments", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            UserPayments::GetUserPayments(request, res, db);
        });

        server.Get("/user/:id/refunds", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            UserRefunds::GetUserRefunds(request, res, db);
        });

        server.Post("/payments/provider/add", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            AddPaymentProvider::AddProviderRequest(request, res, db);
        });

        server.Get("/payments/providers", [&db, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            Providers::GetProvidersRequest(request, res, db);
        });

        std::cout << "Server is listening http://localhost:8008" << '\n';
        server.listen("0.0.0.0", 8008);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}
