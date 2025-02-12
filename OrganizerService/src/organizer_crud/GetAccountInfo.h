#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include "../../third_party/httplib.h"
#include "../../third_party/nlohmann/json.hpp"
#include "../postgres/PostgresProcessing.h"
#include "../utils/ValidDataChecker.h"

class GetAccountInfo {
    using json = nlohmann::json;

public:
    static void GetAccountInfoRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    static pqxx::result getData(const std::string& id, Database& db);

    static void sendError(httplib::Response& res, int status, const std::string& message);

    static json getOrganizerInfoJson(const std::string& id, Database& db);
};

class ValidatorGetter {
    static bool CheckOrganizerExistence(const std::string& id, Database& db) {
        static const std::string query = "SELECT 1 FROM Organizers.OrganizersData WHERE organizer_id = $1";
        std::vector<std::string> params = {id};
        pqxx::result result = db.executeQueryWithParams(query, params);
        return !result.empty();
    }

public:
    static bool validateRequest(const std::string& organizer_id, httplib::Response& res, Database& db) {
        if (!DataCheker::isValidUUID(organizer_id)) {
            GetAccountInfo::sendError(res, 400, "Invalid organizer_id format");
            spdlog::error("Не валидный формат organizer_id, отказано в получении информации об организаторе");
            return false;
        }
        if (!CheckOrganizerExistence(organizer_id, db)) {
            spdlog::error("Организатор с organizer_id = {} не найден", organizer_id);
            GetAccountInfo::sendError(res, 404, "User not found");
            return false;
        }
        return true;
    }
};