#include <iostream>
#include <yaml-cpp/yaml.h>

struct DatabaseCfg {
    std::string host;
    int port;
    std::string db_name;
    std::string user;
    std::string password;
    std::string init_db_path;
};


struct ServerCfg {
    std::string host;
    int port;
};

struct Config {
    ServerCfg server_;
    DatabaseCfg database_;

    static Config MustLoadConfig(const std::string& path);
};