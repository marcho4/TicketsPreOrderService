#pragma once
#include <regex>

class DataCheker {
public:
    static bool isValidEmailFormat(const std::string& email) {
        const std::regex pattern(R"(^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$)");
        return std::regex_match(email, pattern);
    }

    static bool isValidPhoneNumber(const std::string& number) {
        const std::regex pattern(R"(^(\+7|8)[0-9]{10}$)");
        return std::regex_match(number, pattern);
    }
};