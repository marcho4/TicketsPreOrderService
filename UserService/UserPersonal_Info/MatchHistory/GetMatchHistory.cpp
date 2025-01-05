#include "GetMatchHistory.h"

// /user/{id}/get_match_history - запрос

void GetMatchHistory::GetMatchHistoryRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    int user_id = std::stoi(req.matches[1]);
    auto parsed = json::parse(req.body);
    std::string email = parsed["email"];

    std::string query_ticket_id = "SELECT ticket_id FROM Users.Tickets WHERE user_id = $1";
    pqxx::result response_ticket_id = db.executeQueryWithParams(query_ticket_id, user_id);

    if (response_ticket_id.empty()) {
        res.status = 200;
        res.set_content(R"({"error": "No match history. (No matches had been attended) "})", "application/json");
    } else {
        res.status = 200;
        // сделать запрос в микросервис билетов/матчей, чтобы получить информацию о матчах
        // нужны только поля: название матча дата, время, место проведения, номер ряда и места, цена билета
        json response_json;
        // формируем json-чик и отправляем во фронт (пока что просто пустой json)
        res.set_content(response_json.dump(), "application/json");
    }
    return;
}