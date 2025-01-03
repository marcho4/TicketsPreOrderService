#pragma once
#include <pqxx/pqxx>
#include <iostream>
#include <fstream>

class Database {
pqxx::connection conn_;

public:
    Database() {};

    Database(const std::string& con);

    pqxx::result executeQuery(const std::string& query);

    void initDbFromFile(const std::string& filename);

    pqxx::result updateUserData(const std::string& email,
                        const std::string& name, const std::string& phone, const std::string& birthday);
};
