#pragma once
#include <iostream>
#include <vector>
class Helper {
public:
    static std::vector<std::string> split(const std::string& row) {
        std::vector<std::string> result;
        std::string word;
        for (char symbol : row) {
            if (symbol == ',') {
                result.push_back(word);
                word.clear();
            } else {
                word += symbol;
            }
        }
        result.push_back(word);
        return result;
    }
};
