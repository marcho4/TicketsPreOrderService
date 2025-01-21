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

    pqxx::result executeQueryWithParams(const std::string &query, const std::string& email,
                                        const std::string& name, const std::string& last_name, const std::string& role) {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(pqxx::zview(query), email, name, last_name, role);
        txn.commit();
        return res;
    }

    pqxx::result executeQueryWithParams(const std::string &query, const std::string& email,
                                        const std::string& name, const std::string& last_name) {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(pqxx::zview(query), email, name, last_name);
        txn.commit();
        return res;
    }

    pqxx::result executeQueryWithParams(const std::string &query, const std::string& email) {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(pqxx::zview(query), email);
        txn.commit();
        return res;
    }

    pqxx::result executeQueryWithParams(const std::string &query, const std::string& first, const std::string& second) {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(pqxx::zview(query), first, second);
        txn.commit();
        return res;
    }

    pqxx::result executeQueryWithParams(const std::string &query, std::string& id) {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(pqxx::zview(query), id);
        txn.commit();
        return res;
    }

    void initDbFromFile(const std::string& filename);
};
