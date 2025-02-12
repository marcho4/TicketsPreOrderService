cmake_minimum_required(VERSION 3.10)
project(UserService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
# Source files
set(SOURCE_FILES
        main.cpp
        src/api/user/CreateAccount.cpp
        src/api/user/CreateAccount.h
        src/database/Database.cpp
        src/database/Database.h
        src/utils/ValidDataChecker.h
        src/utils/ErrorHandler.h
        src/api/events/GetMatchHistory.cpp
        src/api/events/GetMatchHistory.h
        src/api/user/UpdateAccount.cpp
        src/api/user/UpdateAccount.h
        src/api/user/GetAccountData.cpp
        src/api/user/GetAccountData.h
        src/api/preorders/GetPreorders.h
        src/api/preorders/Preorder.cpp
        src/api/preorders/Preorder.h
        src/api/preorders/PreorderCancel.cpp
        src/api/preorders/PreorderCancel.h
        third_party/Bcrypt.cpp/src/bcrypt.cpp
        third_party/Bcrypt.cpp/include/bcrypt.h
        third_party/Bcrypt.cpp/src/blowfish.cpp
)

include_directories("/opt/homebrew/Cellar/curl/8.12.0/include")
link_directories("/opt/homebrew/Cellar/curl/8.12.0/lib")

include_directories("/opt/homebrew/opt/libpqxx/include")
link_directories("/opt/homebrew/opt/libpqxx/lib")

# Include directories
include_directories("third_party/Bcrypt.cpp/include")
include_directories("third_party/libpqxx/include")
include_directories("/opt/homebrew/opt/openssl@3/include")

# Find the third_party
find_package(CURL REQUIRED)
find_package(spdlog REQUIRED)
# Create executable
add_executable(UserService ${SOURCE_FILES})

# Link the third_party
target_link_libraries(UserService PRIVATE CURL::libcurl spdlog::spdlog
        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib
        pqxx)