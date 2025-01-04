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

    pqxx::result updateOrganizerData(int id, const std::string& email, const std::string& organization_name,
                                               const std::string& tin, const std::string& phone_number);

    pqxx::result createOrganizerData(const std::string& organization_name, const std::string& tin,
                                               const std::string& email, const std::string& phone_number);

    pqxx::result executeQueryWithParams(const std::string& query, int organizer_id, int match_id);

    pqxx::result createMatch(int organizer_id, const std::string& team_home, const std::string& team_away,
                                       const std::string& match_date, const std::string& match_time,
                                       const std::string& stadium, const std::string& match_description);

    pqxx::result executeQueryWithParams(const std::string& query, const std::string& team_home,
                                                  const std::string& team_away, const std::string& match_date, int organizer_id);

    pqxx::result updateMatch(int organizer_id, int match_id, const std::string& team_home, const std::string& team_away,
                                       const std::string& match_date, const std::string& match_time,
                                       const std::string& stadium, const std::string& match_description);
};
