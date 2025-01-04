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

pqxx::result Database::updateOrganizerData(const std::string& email, const std::string& organization_name,
                                           const std::string& tin, const std::string& phone_number) {
    try {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(
                "UPDATE Organizers.OrganizersData SET organization_name = $1, tin = $2, phone_number = $3, updated_at = CURRENT_TIMESTAMP WHERE email = $4",
                organization_name, tin, phone_number, email
        );
        txn.commit();
        return res;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << '\n';
        return pqxx::result();  // Return an empty result on error
    }
}

pqxx::result Database::createOrganizerData(const std::string& organization_name, const std::string& tin,
                                           const std::string& email, const std::string& phone_number) {
    try {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(
                "INSERT INTO Organizers.OrganizersData (organization_name, tin, email, phone_number) VALUES ($1, $2, $3, $4)",
                organization_name, tin, email, phone_number
        );
        txn.commit();
        return res;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << '\n';
        return pqxx::result();
    }
}

pqxx::result Database::createMatch(int organizer_id, const std::string& team_home, const std::string& team_away,
                                   const std::string& match_date, const std::string& match_time,
                                   const std::string& stadium, const std::string& match_description) {
    try {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(
                "INSERT INTO Organizers.Matches (organizer_id, team_home, team_away, match_date, match_time, stadium, match_description) "
                "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING match_id",
                organizer_id, team_home, team_away, match_date, match_time, stadium, match_description
        );
        txn.commit();
        return res;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << '\n';
        return pqxx::result();
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

pqxx::result Database::executeQueryWithParams(const std::string& query, const std::string& team_home,
                                              const std::string& team_away, const std::string& match_date) {
    try {
        pqxx::work txn(conn_);
        pqxx::result res = txn.exec_params(query, team_home, team_away, match_date);
        txn.commit();
        return res;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << '\n';
        pqxx::result empty_result;
        return empty_result;
    }
}