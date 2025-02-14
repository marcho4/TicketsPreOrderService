#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "../../utils/Helper.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>

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


