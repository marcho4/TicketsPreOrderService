cmake_minimum_required(VERSION 3.10)
project(UserService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
# Source files
set(SOURCE_FILES
        main.cpp
        src/api/UserAccountCRUD/CreateAccount.cpp
        src/api/UserAccountCRUD/CreateAccount.h
        src/postgres/PostgresProcessing.cpp
        src/postgres/PostgresProcessing.h
        src/utils/ValidDataChecker.h
        src/ErrorHandler.h
        src/api/MatchHistory/GetMatchHistory.cpp
        src/api/MatchHistory/GetMatchHistory.h
        src/api/UserAccountCRUD/UpdateAccount.cpp
        src/api/UserAccountCRUD/UpdateAccount.h
        src/api/UserAccountCRUD/GetAccountData.cpp
        src/api/UserAccountCRUD/GetAccountData.h
        libraries/Bcrypt.cpp/src/bcrypt.cpp
        libraries/Bcrypt.cpp/include/bcrypt.h
        libraries/Bcrypt.cpp/src/blowfish.cpp
)

include_directories("/opt/homebrew/Cellar/curl/8.12.0/include")
link_directories("/opt/homebrew/Cellar/curl/8.12.0/lib")

include_directories("/opt/homebrew/opt/libpqxx/include")
link_directories("/opt/homebrew/opt/libpqxx/lib")

# Include directories
include_directories("libraries/Bcrypt.cpp/include")
include_directories("libraries/libpqxx/include")
include_directories("/opt/homebrew/opt/openssl@3/include")

# Find the libraries
find_package(CURL REQUIRED)
# Create executable
add_executable(UserService ${SOURCE_FILES})

# Link the libraries
target_link_libraries(UserService PRIVATE CURL::libcurl
        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib
        pqxx)