#include "GetPersonalData.h"

void GetPersonalData::GetPersonalDataRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    // получаем запрос->вытягиваем id->проверяем на существование пользователя->вытягиваем данные из бд->формируем ответ->отправляем на фронт
    int user_id = std::stoi(req.matches[1]);

    if (!CheckUserExistence(user_id, db)) {
        res.status = 404;
        res.set_content(R"({"error": "User not found"})", "application/json");
        return;
    }

    std::string query = "SELECT * FROM Users.Users WHERE user_id = $1";
    pqxx::result response = db.executeQueryWithParams(query, user_id);

    SendPersonalData(response, res, db);
}

bool GetPersonalData::CheckUserExistence(int user_id, Database& db) {
    std::string query = "SELECT name FROM Users.Users WHERE user_id = $1";
    pqxx::result response = db.executeQueryWithParams(query, user_id);
    return !response.empty();
}

void GetPersonalData::SendPersonalData(pqxx::result& data, httplib::Response& res, Database& db) {
    // сформировали ответ
    json response_json;
    response_json["name"] = data[0]["name"].as<std::string>();
    response_json["email"] = data[0]["email"].as<std::string>();
    response_json["phone"] = data[0]["phone"].as<std::string>();
    response_json["birthday"] = data[0]["birthday"].as<std::string>();

    res.status = 200;
    // отдали на фронт
    res.set_content(response_json.dump(), "application/json");
}