#pragma once

#include "../../third_party/httplib.h"

class ErrorHandler {
public:
    static void sendError(httplib::Response& res, int status, const std::string& message) {
        res.status = status;
        res.set_content(R"({"message": ")" + message + R"("})", "application/json");
    }
};