#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "../../postgres/PostgresProcessing.h"
#include "../../ErrorHandler.h"
#include "../../Helper.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>

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

class AddTickets {
    using json = nlohmann::json;

    struct Ticket {
        std::string price;
        std::string sector;
        std::string row;
        std::string seat;

        Ticket(const std::string& price, const std::string& sector, const std::string& row, const std::string& seat) :
            price(price), sector(sector), row(row), seat(seat) {}
    };

    static std::pair<int, std::vector<Ticket>> GetTicketsFromCSV(httplib::MultipartFormData& file, httplib::Response& res) {
        std::vector<Ticket> tickets;
        std::stringstream file_stream(file.content);
        std::string line;
        int invalid_rows = 0;

        while (std::getline(file_stream, line)) {
            std::vector<std::string> ticket_data = Helper::split(line);

            if (!FileValidator::ValidateFileRow(ticket_data)) {
                spdlog::warn("Некорректная строка в CSV: {}", line);
                invalid_rows++;
                continue;
            }

            if (ticket_data.size() < 4) {
                spdlog::error("Недостаточно данных в строке CSV: {}", line);
                continue;
            }
            tickets.push_back(Ticket(ticket_data[0], ticket_data[1], ticket_data[2], ticket_data[3]));
        }
        spdlog::info("Загружено {} билетов", tickets.size());
        return {invalid_rows, tickets};
    }

public:
    static void AddingTicketsRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static void AddTicketToDatabase(const std::string& match_id, const Ticket& ticket, Database& db);
};


