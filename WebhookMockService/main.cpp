#include <iostream>
#include "third_party/httplib.h"
#include "src/api/payments/PaymentWorker.h"

int main() {
    
    try {
        httplib::Server server;
        PaymentWorker worker;

        server.Options(".*", [&](const httplib::Request& req, httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "http://localhost:8008");
            res.set_header("Access-Control-Allow-Credentials", "true");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.set_header("Content-Type", "application/json");
            res.status = 200;
        });

        auto set_cors_headers = [&](httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "http://localhost:8008");
            res.set_header("Access-Control-Allow-Credentials", "true");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.set_header("Content-Type", "application/json");
        };

        server.Post("/payments/create", [&worker, &set_cors_headers](const httplib::Request& request, httplib::Response &res) {
            set_cors_headers(res);
            worker.PaymentRequest(request, res);
        });

        std::cout << "Server is listening http://localhost:8009" << '\n';
        server.listen("0.0.0.0", 8009);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}
