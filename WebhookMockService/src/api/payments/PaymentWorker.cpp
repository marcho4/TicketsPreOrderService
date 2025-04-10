#include "PaymentWorker.h"
#include <iostream>

std::unordered_map<std::string, std::string> PaymentWorker::payments;

void PaymentWorker::PaymentRequest(const httplib::Request& request, httplib::Response& res) {
    try {
        std::cout << "Received payment request" << std::endl;
        auto parsed = json::parse(request.body);
        std::string payment_id = parsed["payment_id"];
        std::string callback_url = parsed["callback_url"];
        
        std::cout << "Payment ID: " << payment_id << std::endl;
        std::cout << "Callback URL: " << callback_url << std::endl;
        
        payments[payment_id] = callback_url;

        std::thread(&PaymentWorker::SimulatePaymentProcessing, this, payment_id).detach();

        res.status = 200;
        json response = {
                {"message", "Payment processed"},
                {"payment_url", "http://payment_url/" + payment_id}
        };
        res.set_content(response.dump(), "application/json");
        std::cout << "Sent response: " << response.dump() << std::endl;
    } catch (const std::exception& e) {
        std::cout << "Error in PaymentRequest: " << e.what() << std::endl;
        res.status = 500;
        json error_response = {{"error", e.what()}};
        res.set_content(error_response.dump(), "application/json");
    }
}

void PaymentWorker::SimulatePaymentProcessing(const std::string& payment_id) {
    try {
        std::cout << "Starting payment processing for ID: " << payment_id << std::endl;
        
        std::this_thread::sleep_for(std::chrono::seconds(5 + rand() % 10));

        std::string payment_status = (rand() % 100 < 90) ? "success" : "failed";
        std::cout << "Payment status: " << payment_status << std::endl;

        if (payments.find(payment_id) == payments.end()) {
            std::cout << "Error: payment_id " << payment_id << " not found in payments map" << std::endl;
            return;
        }

        std::string callback_url = payments[payment_id];
        std::cout << "Attempting callback to URL: " << callback_url << std::endl;
        
        // Попробуем разобрать URL для диагностики
        std::string host, path;
        int port = 80;
        
        // Простой разбор URL (http://host:port)
        size_t protocol_end = callback_url.find("://");
        if (protocol_end != std::string::npos) {
            size_t host_start = protocol_end + 3;
            size_t port_pos = callback_url.find(":", host_start);
            size_t path_pos = callback_url.find("/", host_start);
            
            if (port_pos != std::string::npos && (path_pos == std::string::npos || port_pos < path_pos)) {
                host = callback_url.substr(host_start, port_pos - host_start);
                size_t port_end = (path_pos != std::string::npos) ? path_pos : callback_url.length();
                port = std::stoi(callback_url.substr(port_pos + 1, port_end - port_pos - 1));
            } else {
                host = callback_url.substr(host_start, (path_pos != std::string::npos) ? path_pos - host_start : std::string::npos);
            }
            
            if (path_pos != std::string::npos) {
                path = callback_url.substr(path_pos);
            } else {
                path = "/";
            }
        }
        
        std::cout << "URL components: Host=" << host << ", Port=" << port << ", Path=" << path << std::endl;
        
        // Попробуем проверить доступность хоста
        std::cout << "Testing connection to " << host << ":" << port << std::endl;
        
        httplib::Client client("payment", 8008);
        client.set_connection_timeout(15); // Увеличиваем таймаут до 15 секунд
        client.set_read_timeout(15);
        
        json response = {
                {"payment_id", payment_id},
                {"status", payment_status}
        };
        
        std::cout << "Sending payload: " << response.dump() << std::endl;
        
        auto response_from_server = client.Post("/payments/webhook", response.dump(), "application/json");
        
        if (response_from_server) {
            std::cout << "Callback response status: " << response_from_server->status << std::endl;
            std::cout << "Callback response body: " << response_from_server->body << std::endl;
        } else {
            std::cout << "Callback failed. Unable to connect to " << callback_url << std::endl;
            std::cout << "Check if the payment service is running and has endpoint /payments/webhook" << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "Error in SimulatePaymentProcessing: " << e.what() << std::endl;
    }
}