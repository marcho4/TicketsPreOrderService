#include "../../../libraries/httplib.h"
#include "../../../libraries/nlohmann/json.hpp"
#include "../../../postgres/PostgresProcessing.h"

class AccountDeleter {
    using json = nlohmann::json;

public:
    void DeleteAccountRequest(const httplib::Request& req, httplib::Response& res, Database& db);

    void ClearData(const std::string& email, Database& db, int user_id);

    // пользователь->удалить аккаунт->распарсить запрос->проверить наличие пользователя->
    // проверить наличие активных билетов/предзаказов->удалить данные пользователя->
    // аннулировать билеты/предзаказы->вернуть статус->удалить аккаунт->вернуть статус->отправить уведомление
};
