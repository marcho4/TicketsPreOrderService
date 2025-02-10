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
        if (row.size() != 4) {
            return false;
        }
        return true;
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

    static std::vector<Ticket> GetTicketsFromCSV(httplib::MultipartFormData& file, httplib::Response& res) {
        std::vector<Ticket> tickets;
        std::stringstream file_stream(file.content);
        std::string line;

        while (std::getline(file_stream, line)) {
            std::vector<std::string> ticket_data = Helper::split(line);

            if (!FileValidator::ValidateFileRow(ticket_data)) {
                spdlog::warn("Некорректная строка в CSV: {}", line);
                continue;
            }

            if (ticket_data.size() < 4) {
                spdlog::error("Недостаточно данных в строке CSV: {}", line);
                continue;
            }
            tickets.push_back(Ticket(ticket_data[0], ticket_data[1], ticket_data[2], ticket_data[3]));
        }
        spdlog::info("Загружено {} билетов", tickets.size());
        return tickets;
    }

public:
    static void AddingTicketsRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static void AddTicketToDatabase(const std::string& match_id, const Ticket& ticket, Database& db);
};


