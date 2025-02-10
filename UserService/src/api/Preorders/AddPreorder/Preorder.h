#include "../../../../libraries/httplib.h"
#include "../../../../libraries/nlohmann/json.hpp"
#include "../../../postgres/PostgresProcessing.h"
#include "../../../ErrorHandler.h"
#include <spdlog/spdlog.h>

class Preorder {
    using json = nlohmann::json;

    struct PreorderData {
        std::string match_id;
        std::string ticket_id;
        std::string date;

        static PreorderData GetDataFromRequest(const json& parsed) {
            std::string match_datetime_to_parse = parsed["match_datetime"];
            match_datetime_to_parse = match_datetime_to_parse.substr(0, match_datetime_to_parse.find("Z"));
            std::replace(match_datetime_to_parse.begin(), match_datetime_to_parse.end(), 'T', ' ');

            return {parsed["match_id"],
                    parsed["ticket_id"],
                    match_datetime_to_parse};
        }
    };

public:
    static void AddPreorderRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static void AddPreorder(const std::string& user_id, PreorderData data, Database& db);
};



