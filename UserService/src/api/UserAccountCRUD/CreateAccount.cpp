#include "CreateAccount.h"

void AccountCreator::CreateUserAccountRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    UserData user_data = UserData::GetUserDataFromJSON(json::parse(req.body));

    if (!CheckUserExistence(user_data, db)) {
        ErrorHandler::sendError(res, 409, "User already exists");
        spdlog::error("Пользователь с email: {} уже существует, отказано в создании", user_data.email);
        return;
    }

    pqxx::result result = UserCreatingResponseToDB(user_data, db);

    if (!result.empty() && !result[0]["user_id"].is_null()) {
        nlohmann::json json_response = {
            {"message", "User created successfully"},
            {"status", "created"},
            {"data", {
                    {"id", result[0]["user_id"].as<std::string>()},
                    {"role", "USER"}
                }
            }
        };
        spdlog::info("Пользователь с email: {} успешно создан, id пользователя - {}", user_data.email,
                     result[0]["user_id"].as<std::string>());
        res.status = 201;
        res.set_content(json_response.dump(), "application/json");
    } else {
        spdlog::error("Не удалось вставить данные в базу данных") ;
        ErrorHandler::sendError(res, 500, "Failed to insert data into the database");
    }
}

bool AccountCreator::CheckUserExistence(const AccountCreator::UserData &user_data, Database &db) {
    std::string query = "SELECT * FROM Users.UsersData WHERE email = $1";
    std::vector<std::string> params = {user_data.email};
    pqxx::result result = db.executeQueryWithParams(query, params);

    return result.empty();
}

pqxx::result AccountCreator::UserCreatingResponseToDB(const UserData& user_data, Database& db) {
    std::string create_user = "INSERT INTO Users.UsersData (name, last_name, email, phone, birthday) "
                              "VALUES ($1, $2, $3, $4, $5) RETURNING user_id";
    std::vector<std::string> params = {user_data.name, user_data.last_name, user_data.email, user_data.phone, user_data.birthday};

    pqxx::result result;

    try {
        result = db.executeQueryWithParams(create_user, params);
    } catch (const std::exception& e) {
        spdlog::error("Не удалось создать пользователя");
        throw std::runtime_error("Failed to create user");
    }
    return result;
}