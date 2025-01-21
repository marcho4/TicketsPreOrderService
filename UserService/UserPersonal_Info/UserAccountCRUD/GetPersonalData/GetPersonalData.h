#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "../../../postgres/PostgresProcessing.h"

class GetPersonalData {
    using json = nlohmann::json;

public:
    void GetPersonalDataRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    bool CheckUserExistence(int user_id, Database& db);

    // выкидываем данные о пользователе на фронт по запросу
    void SendPersonalData(pqxx::result& data, httplib::Response& res, Database& db);
};

