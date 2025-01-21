#include "DeleteAccountImpl.h"

void AccountDeleter::DeleteAccountRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    auto parsed = json::parse(req.body);
    std::string email = parsed["email"];
    std::string query = "SELECT user_id FROM Users.UsersData WHERE email = $1";
    pqxx::result response = db.executeQueryWithParams(query, email);

    if (response.empty()) {
        res.status = 404;
        res.set_content(R"({"error": "User not found"})", "application/json");
        return;
    }
    int user_id = response[0]["user_id"].as<int>(); // не уверен насчет этого мува

    ClearData(email, db, user_id); // удаляем все связанные данные

    res.status = 200;
    res.set_content(R"({"status": "Account deleted successfully"})", "application/json");

    // отдать запрос в оркестратора чтобы он уведомил пользователя и другие микросервисы об удалении пользователя
    return;
}

void AccountDeleter::ClearData(const std::string& email, Database& db, int user_id) {
    std::string query = "DELETE FROM Users.Orders WHERE user_id = $1";
    db.executeQueryWithParams(query, std::to_string(user_id));

    query = "DELETE FROM Users.UsersData WHERE user_id = $1";
    db.executeQueryWithParams(query, std::to_string(user_id));

    // аналогично для других таблиц
}