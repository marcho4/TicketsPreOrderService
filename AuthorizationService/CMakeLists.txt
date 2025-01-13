cmake_minimum_required(VERSION 3.10)
project(TicketsPreOrderService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_OSX_ARCHITECTURES "arm64")
# Source files
set(SOURCE_FILES
        main.cpp
        Authorization/AuthorizationManager.cpp
        Authorization/AuthorizationManager.h
        OrganizerRegistration/RegistrationOrganizerManager.cpp
        OrganizerRegistration/RegistrationOrganizerManager.h
        UserRegistration/RegistrationUserManager.cpp
        UserRegistration/RegistrationUserManager.h
        AuxiliaryFunctions/AuxiliaryFunctions.cpp
        AuxiliaryFunctions/AuxiliaryFunctions.h
        postgres/PostgresProcessing.h
        postgres/PostgresProcessing.cpp
        UserRegistration/PasswordGenerator/PasswordCreator.cpp
        ../libraries/Bcrypt.cpp/src/bcrypt.cpp
        ../libraries/Bcrypt.cpp/include/bcrypt.h
        ../libraries/Bcrypt.cpp/src/blowfish.cpp
)

include_directories("/opt/homebrew/Cellar/curl/8.12.0/include")
link_directories("/opt/homebrew/Cellar/curl/8.12.0/lib")

include_directories("/opt/homebrew/opt/libpqxx/include")
link_directories("/opt/homebrew/opt/libpqxx/lib")

# Include directories
include_directories("/Users/nazarzakrevskij/TicketsPreOrderService/libraries/Bcrypt.cpp/include")
include_directories("../libraries/libpqxx/include")
include_directories("/opt/homebrew/opt/openssl@3/include")

# Find the libraries
find_package(CURL REQUIRED)
# Create executable
add_executable(TicketsPreOrderService ${SOURCE_FILES})

# Link the libraries
target_link_libraries(TicketsPreOrderService PRIVATE CURL::libcurl
        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib
pqxx)