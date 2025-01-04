#pragma once
#include <pqxx/pqxx>
#include <iostream>
#include <fstream>

class Database {
pqxx::connection conn_;

public:
    Database() {};

    Database(const std::string& con);

    pqxx::result executeQuery(const std::string &query);

    void initDbFromFile(const std::string& filename);

    pqxx::result updateOrganizerData(const std::string& email, const std::string& organization_name,
                                               const std::string& tin, const std::string& phone_number);

    pqxx::result createOrganizerData(const std::string& organization_name, const std::string& tin,
                                               const std::string& email, const std::string& phone_number);

    pqxx::result executeQueryWithParams(const std::string& query, const std::string& param);
};
