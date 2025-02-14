#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "../../../postgres/PostgresProcessing.h"
#include "../../../src/ErrorHandler.h"
#include "../../../Helper.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/rotating_file_sink.h"

class TicketsReservation {
    using json = nlohmann::json;

    struct Ticket {
        std::string user_id;
        std::string match_id;

        static Ticket getTicketData(const json& parsed) {
            return {parsed.at("user_id").get<std::string>(),
                    parsed.at("match_id").get<std::string>()};
        }
    };

    static void ReserveTicket(const std::string& ticket_id, const std::string& user_id,
                              const std::string& match_id, Database& db);

public:
    static void ReserveTicketsRequest(const httplib::Request& req, httplib::Response& res, Database& db);
};


