cmake_minimum_required(VERSION 3.10)
project(OrganizerService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
# Source files
set(SOURCE_FILES
        main.cpp
        src/FormatRegexHelper/ValidDataChecker.h
        src/OrganizerAccountCRUD/CreateOrganizerAccount.cpp
        src/OrganizerAccountCRUD/CreateOrganizerAccount.h
        src/OrganizerAccountCRUD/UpdateOrganizerAccount.cpp
        src/OrganizerAccountCRUD/UpdateOrganizerAccount.h
        src/OrganizerAccountCRUD/GetAccountInfo.cpp
        src/OrganizerAccountCRUD/GetAccountInfo.h
        src/postgres/PostgresProcessing.h
        src/postgres/PostgresProcessing.cpp
        src/MatchCreating/AddingTickets/AddingTickets.cpp
        src/MatchCreating/AddingTickets/AddingTickets.h
        src/MatchCreating/CreateMatch/MatchCreator.cpp
        src/MatchCreating/CreateMatch/MatchCreator.h
        src/MatchCreating/UpdateMatchInfo/Updator.cpp
        src/MatchCreating/UpdateMatchInfo/Updator.h
        libraries/Bcrypt.cpp/src/bcrypt.cpp
        libraries/Bcrypt.cpp/include/bcrypt.h
        libraries/Bcrypt.cpp/src/blowfish.cpp
        src/MatchCreating/GetMatchInfo/GetMatchData.h
        src/MatchCreating/GetMatchInfo/GetMatchData.cpp
        ../AuthorizationService/src/api/Admin/AdminAuthorization.cpp
        ../AuthorizationService/src/api/Admin/AdminCreation.h
        ../AuthorizationService/src/api/Authorization/AuthorizationManager.cpp
        ../AuthorizationService/src/ErrorHandler.h
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
find_package(spdlog REQUIRED)
# Create executable
add_executable(OrganizerService ${SOURCE_FILES})

# Link the libraries
target_link_libraries(OrganizerService PRIVATE CURL::libcurl spdlog::spdlog
        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib
        pqxx)