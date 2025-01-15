cmake_minimum_required(VERSION 3.10)
project(AuthorizationService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
# Source files
set(SOURCE_FILES
        main.cpp
        src/Authorization/AuthorizationManager.cpp
        src/Authorization/AuthorizationManager.h
        src/OrganizerRegistration/RegistrationOrganizerManager.cpp
        src/OrganizerRegistration/RegistrationOrganizerManager.h
        src/UserRegistration/RegistrationUserManager.cpp
        src/UserRegistration/RegistrationUserManager.h
        src/AuxiliaryFunctions/AuxiliaryFunctions.cpp
        src/AuxiliaryFunctions/AuxiliaryFunctions.h
        src/postgres/PostgresProcessing.h
        src/postgres/PostgresProcessing.cpp
        src/UserRegistration/PasswordGenerator/PasswordCreator.cpp
        ../libraries/Bcrypt.cpp/src/bcrypt.cpp
        ../libraries/Bcrypt.cpp/include/bcrypt.h
        ../libraries/Bcrypt.cpp/src/blowfish.cpp
)

include_directories("/opt/homebrew/Cellar/curl/8.12.0/include")
link_directories("/opt/homebrew/Cellar/curl/8.12.0/lib")

include_directories("/opt/homebrew/opt/libpqxx/include")
link_directories("/opt/homebrew/opt/libpqxx/lib")

# Include directories
include_directories("../../libraries/Bcrypt.cpp/include")
include_directories("../libraries/libpqxx/include")
include_directories("/opt/homebrew/opt/openssl@3/include")

# Find the libraries
find_package(CURL REQUIRED)
# Create executable
add_executable(AuthorizationService ${SOURCE_FILES})

# Link the libraries
target_link_libraries(AuthorizationService PRIVATE CURL::libcurl
        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib
pqxx)