#include <iostream>
#include <random>
#include "../../../libraries/Bcrypt.cpp/include/bcrypt.h"
#include "../../postgres/PostgresProcessing.h"

struct LoginData {
    std::string password;
    std::string login;
};

class PasswordCreator {
public:
    static std::string generateRandomData();

    static LoginData generatePasswordAndLogin(const std::string& name, const std::string& surname, Database& db, int length = 16);

    static std::string generateLogin(const std::string& name, const std::string& surname);

    static std::vector<std::string> HashAndSavePassword(LoginData& data, Database& db);
};

