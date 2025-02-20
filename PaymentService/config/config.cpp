#include "config.h"

Config Config::MustLoadConfig(const std::string& path) {
    Config config;
    try {
        YAML::Node root = YAML::LoadFile(path);

        auto db = root["database"];
        config.database_.db_name = db["db_name"].as<std::string>();
        config.database_.host = db["db_host"].as<std::string>();
        config.database_.port = db["db_port"].as<int>();
        config.database_.user = db["db_user"].as<std::string>();
        config.database_.password = db["db_password"].as<std::string>();
        config.database_.init_db_path = db["init_sql"].as<std::string>();

        auto server = root["server"];
        config.server_.host = server["host"].as<std::string>();
        config.server_.port = server["port"].as<int>();
    } catch (...) {
        std::cerr << "Failed to load config" << std::endl;
        throw;
    }
    return config;
}