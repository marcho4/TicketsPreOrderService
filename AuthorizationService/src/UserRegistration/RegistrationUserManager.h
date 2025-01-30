#pragma once
#include <iostream>
#include "../../libraries/httplib.h"
#include "../../libraries/nlohmann/json.hpp"
#include "../postgres/PostgresProcessing.h"
#include "PasswordGenerator/PasswordCreator.h"
#include "../ErrorHandler.h"
#include "../AuxiliaryFunctions/AuxiliaryFunctions.h"
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>

class UserRegistration {
    using json = nlohmann::json;
    PasswordCreator creator;

    struct UserData {
        std::string email;
        std::string name;
        std::string last_name;
        std::string password;
        std::string login;

        static UserData getUserData(json& parsed) {
            return {parsed.at("email").get<std::string>(),
                    parsed.at("name").get<std::string>(),
                    parsed.at("last_name").get<std::string>(),
                    parsed.at("password").get<std::string>(),
                    parsed.at("login").get<std::string>()};
        }
    };

public:
    static void RegisterUserRequest(const httplib::Request& request,
                                    httplib::Response &res, Database& db);

    static void RegisterUser(UserData user_data, Database& db);

    static pqxx::result SaveLoginData(UserData& user_data, std::vector<std::string>& params, Database& db);
};

class Validator {
    using json = nlohmann::json;

    struct UserData {
        std::string email;
        std::string name;
        std::string last_name;
        std::string password;
        std::string login;

        static UserData getUserData(const json& parsed) {
            return {parsed.at("email").get<std::string>(),
                    parsed.at("name").get<std::string>(),
                    parsed.at("last_name").get<std::string>(),
                    parsed.at("password").get<std::string>(),
                    parsed.at("login").get<std::string>()};
        }
    };

    static bool checkRequiredFields(const json& parsed, const std::vector<std::string>& required_fields) {
        for (const auto& field : required_fields) {
            if (parsed.find(field) == parsed.end()) {
                return false;
            }
        }
        return true;
    }

    static bool CheckEmailUniquenessOrUserExistence(const std::string &email, Database& db) {
        std::string query = "SELECT * FROM AuthorizationService.AuthorizationData WHERE email = $1";
        std::vector<std::string> params = {email};
        pqxx::result res = db.executeQueryWithParams(query, params);
        if (!res.empty()) {
            return false;
        }
        query = "SELECT * FROM AuthorizationService.TemplateUser WHERE email = $1";
        res = db.executeQueryWithParams(query, params);
        if (!res.empty()) {
            return false;
        }
        return true;
    }

public:
    static bool ValidateData(const json& parsed, httplib::Response& res, Database& db) {
        std::vector<std::string> required_fields = {"email", "name", "last_name", "password", "login"};
        if (!checkRequiredFields(parsed, required_fields)) {
            ErrorHandler::sendError(res, 400, "Missing required fields");
            spdlog::error("Не заполнены обязательные поля, отказано в регистрации");
            return false;
        }

        UserData data = UserData::getUserData(parsed);

        if (!CheckEmailUniquenessOrUserExistence(data.email, db)) {
            ErrorHandler::sendError(res, 400, "Email already exists");
            spdlog::error("Пользователь с таким email: {} уже существует, отказано в регистрации", data.email);
            return false;
        }

        if (data.name.length() > 200 || data.last_name.length() > 200 || data.email.length() > 200) {
            ErrorHandler::sendError(res, 400, "Too long fields");
            spdlog::error("Слишком длинные поля, отказано в регистрации");
            return false;
        }

        if (!AuxiliaryFunctions::isValidEmail(data.email)) {
            ErrorHandler::sendError(res, 400, "Invalid email format or email already exists");
            spdlog::error("Неверный формат email: {} или email уже существует, отказано в регистрации", data.email);
            return false ;
        }
        return true;
    }
};
