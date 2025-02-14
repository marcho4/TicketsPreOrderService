#pragma once
#include <iostream>
#include <vector>
#include <spdlog/spdlog-inl.h>

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

class FileValidator {
public:
    static bool ValidateFileRow(const std::vector<std::string>& row) {
        if (row.size() != 4 || !IsValidPrice(row[0]) || !IsValidSector(row[1])
            || !IsValidRow(row[2]) || !IsValidSeat(row[3])) {
            spdlog::warn("Некорректная строка");
            return false;
        }

        return true;
    }

private:
    static bool IsValidPrice(const std::string& price) {
        try {
            int p = std::stoi(price);
            return p >= 0;
        } catch (const std::exception&) {
            return false;
        }
    }

    static bool IsValidSector(const std::string& sector) {
        if (sector.size() == 1 && std::isupper(sector[0]) && sector[0] >= 'A' && sector[0] <= 'J') {
            return true;
        }
        return false;
    }

    static bool IsValidRow(const std::string& row) {
        try {
            int r = std::stoi(row);
            return r > 0;
        } catch (const std::exception&) {
            return false;
        }
    }

    static bool IsValidSeat(const std::string& seat) {
        try {
            int s = std::stoi(seat);
            return s > 0;
        } catch (const std::exception&) {
            return false;
        }
    }
};