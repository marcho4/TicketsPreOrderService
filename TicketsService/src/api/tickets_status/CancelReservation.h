#include <pqxx/pqxx>
#include "bcrypt.h"
#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "../../utils/Helper.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>

class CancelReservation {
    using json = nlohmann::json;

    static httplib::Client client;

    struct Ticket {
        std::string match_id;

        static Ticket getTicketData(const json& parsed) {
            return {parsed.at("match_id").get<std::string>()};
        }
    };

public:
    static void CancelReservationRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static void CancelTicketReservation(const std::string& ticket_id, const std::string& match_id, Database& db);

private:
    static int GetTicketPrice(const std::string &ticket_id, const std::string &match_id, Database &db);
    
};

