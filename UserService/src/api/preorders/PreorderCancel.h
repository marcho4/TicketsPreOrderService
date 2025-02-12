#include "../../../third_party/httplib.h"
#include "../../../third_party/nlohmann/json.hpp"
#include "../../database/Database.h"
#include "../../utils/ErrorHandler.h"
#include "spdlog/spdlog.h"

class PreorderCancellation {
    using json = nlohmann::json;

    struct PreorderData {
        std::string match_id;
        std::string ticket_id;

        static PreorderData GetDataFromRequest(const json& parsed) {
            return {parsed["match_id"],
                    parsed["ticket_id"]};
        }
    };

public:
    static void CancelPreorderRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static void CancelPreorder(const std::string& user_id, const std::string& match_id, const std::string& ticket_id, Database& db);

    static bool CheckPreorderExistence(const std::string& user_id, const std::string& match_id,
                                       const std::string& ticket_id, Database& db);
};



