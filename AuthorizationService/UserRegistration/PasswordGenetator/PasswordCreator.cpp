#include "PasswordCreator.h"

std::string PasswordCreator::generateRandomData() {
    const std::string all_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm"
                                  "nopqrstuvwxyz0123456789!@#$%^&*()-_=+";

    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist_all(0, all_chars.size() - 1);
    std::string str;
    for (size_t i = 0; i < 16; ++i) {
        str += all_chars[dist_all(gen)];
    }
    return str;
}

std::string PasswordCreator::generateLogin(const std::string& name, const std::string& surname) {
    std::string login = name + "." + surname + generateRandomData();
    return login;
}

LoginData PasswordCreator::generatePasswordAndLogin(const std::string& name,
                                                     const std::string& surname, Database& db, int length) {
    std::string password;
    password.reserve(length);
    password = generateRandomData();
    return LoginData{password, generateLogin(name, surname)};
}

std::vector<std::string> PasswordCreator::HashAndSavePassword(LoginData& data, Database& db) {
    std::string hashedPassword = bcrypt::generateHash(data.password);
    return {data.password, data.login, hashedPassword};
}