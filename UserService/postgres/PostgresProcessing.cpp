#include "PostgresProcessing.h"

Database::Database(const std::string& con) : conn_(con) { }

pqxx::result Database::executeQuery(const std::string &query) {
    try {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec(query);
        std::string ans = std::to_string(res.affected_rows());
        txn.commit();
        return res;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << '\n';
        pqxx::result ans;
        return ans;
    }
}

void Database::initDbFromFile(const std::string &filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        throw std::runtime_error("Could not open file");
    }
    std::stringstream buffer;
    buffer << file.rdbuf();
    std::string sql = buffer.str();

    try {
        pqxx::work txn(conn_);
        txn.exec(sql);
        txn.commit();
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << '\n';
    }
}

pqxx::result Database::updateUserData(const std::string& email,
                        const std::string& name, const std::string& phone, const std::string& birthday) {
    try {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(
                "UPDATE Users.UsersData SET email = $1, name = $2, phone = $3, birthday = $4 WHERE email = $5",
                email, name, phone, birthday, email
        );
        std::string ans = std::to_string(res.affected_rows());
        txn.commit();
        return res;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << '\n';
        pqxx::result ans;
        return ans;
    }
}

pqxx::result Database::CreateUserData(const std::string& email,
                                      const std::string& name, const std::string& phone, const std::string& birthday) {
    try {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(
                "INSERT INTO Users.UsersData (email, name, phone, birthday) VALUES ($1, $2, $3, $4)",
                email, name, phone, birthday
        );
        txn.commit();
        return res;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << '\n';
        pqxx::result ans;
        return ans;
    }
}

pqxx::result Database::executeQueryWithParams(const std::string& query, const std::string& param) {
    try {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(query, param);
        txn.commit();
        return res;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << '\n';
        pqxx::result empty_result;
        return empty_result;
    }
}