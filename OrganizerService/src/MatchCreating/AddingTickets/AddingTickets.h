#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "pqxx/pqxx"
#include "../../postgres/PostgresProcessing.h"

class AddingTickets {
    using json = nlohmann::json;

public:
    void AddTicketsRequest(const httplib::Request& req, httplib::Response& res,
                           Database& db);

    bool CheckMatchExistence(int id, Database& db);
};

