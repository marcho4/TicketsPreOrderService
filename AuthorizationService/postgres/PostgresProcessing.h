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

    template <typename... Args>
    pqxx::result executeQueryWithParams(const std::string &query, Args&&... args) {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(query, std::forward<Args>(args)...);
        txn.commit();
        return res;
    }

    void initDbFromFile(const std::string& filename);
};
