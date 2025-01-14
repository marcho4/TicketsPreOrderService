#include <iostream>
#include <random>
#include "bcrypt.h"
#include "../../postgres/PostgresProcessing.h"

struct LoginData {
    std::string password;
    std::string login;
};

class PasswordCreator {
public:
    static std::string generateRandomData();

    static LoginData generatePasswordAndLoginForUser(const std::string& name, const std::string& email, Database& db, int length = 16);

    static LoginData generatePasswordAndLoginForOrganizer(const std::string& company, Database& db, int length = 16);

    static std::string generateLoginForOrganizer(const std::string& company);

    static std::vector<std::string> HashAndSavePassword(LoginData& data, Database& db);
};

