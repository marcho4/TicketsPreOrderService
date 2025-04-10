#pragma once
#include <pqxx/pqxx>
#include <iostream>
#include <fstream>
#include <mutex>
#include <memory>

class Database {
private:
    pqxx::connection conn_;
    std::mutex conn_mutex_; 

public:
    Database() {};

    Database(const std::string& con);

    void initDbFromFile(const std::string& filename);

    pqxx::result executeQueryWithParams(const std::string& query, std::vector<std::string>& params) {
        std::lock_guard<std::mutex> lock(conn_mutex_); // Блокировка доступа к соединению
        
        try {
            pqxx::work txn(conn_);
            pqxx::result res = txn.exec_params(pqxx::zview(query), pqxx::prepare::make_dynamic_params(params));
            txn.commit();
            return res;
        } catch (const std::exception& e) {
            std::cerr << "Error: " << e.what() << '\n';
            pqxx::result empty_result;
            return empty_result;
        }
    }
    
    template<typename Func>
    auto performTransaction(Func&& func) -> decltype(func(std::declval<pqxx::work&>())) {
        std::lock_guard<std::mutex> lock(conn_mutex_);
        
        pqxx::work txn(conn_);
        try {
            auto result = func(txn);
            txn.commit();
            return result;
        } catch (const std::exception& e) {
            std::cerr << "Transaction error: " << e.what() << '\n';
            throw;
        }
    }
    
    template<typename Func>
    auto withConnection(Func&& func) -> decltype(func(std::declval<pqxx::connection&>())) {
        std::lock_guard<std::mutex> lock(conn_mutex_);
        return func(conn_);
    }
};