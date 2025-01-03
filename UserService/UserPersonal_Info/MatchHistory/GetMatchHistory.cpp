#include "GetMatchHistory.h"

void GetMatchHistory::GetMatchHistoryRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    auto parsed = json::parse(req.body);
    std::string email = parsed["email"];
    std::string query_id = "SELECT user_id FROM Users.UsersData WHERE email = $1";
    pqxx::result response = db.executeQueryWithParams(query_id, email);
    // тут нужно как-то вытянуть из запроса id-шник
    // иначе не понятно, какой именно пользователь запрашивает историю матчей
    int id = response[0][0].as<int>(); // что-то такое, но потом проверю
    // ----------------------------------------------------------------------
    std::string query_ticket_id = "SELECT ticket_id FROM Users.Tickets WHERE user_id = $1";
    pqxx::result response_ticket_id = db.executeQueryWithParams(query_ticket_id, std::to_string(id));
    if (response_ticket_id.empty()) {
        res.status = 200;
        res.set_content(R"({"error": "No match history. (No matches had been attended) "})", "application/json");
    } else {
        res.status = 200;
        // сделать запрос в микросервис билетов/матчей, чтобы получить информацию о матчах
        // нужны только поля: название матча, дата, время, место проведения, номер ряда и места, цена билета
        json response_json;
        // формируем json-чик и отправляем во фронт (пока что просто пустой json)
        res.set_content(response_json.dump(), "application/json");
    }
    return;
}