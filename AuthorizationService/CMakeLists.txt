cmake_minimum_required(VERSION 3.11)
project(AuthorizationService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)

# Source files
set(SOURCE_FILES
        main.cpp
        src/api/Authorization/AuthorizationManager.cpp
        src/api/Authorization/AuthorizationManager.h
        src/api/OrganizerRegistration/RegistrationOrganizerManager.cpp
        src/api/OrganizerRegistration/RegistrationOrganizerManager.h
        src/api/UserRegistration/RegistrationUserManager.cpp
        src/api/UserRegistration/RegistrationUserManager.h
        src/AuxiliaryFunctions/AuxiliaryFunctions.cpp
        src/AuxiliaryFunctions/AuxiliaryFunctions.h
        src/postgres/PostgresProcessing.h
        src/postgres/PostgresProcessing.cpp
        src/api/UserRegistration/PasswordGenerator/PasswordCreator.cpp
        libraries/Bcrypt.cpp/src/bcrypt.cpp
        libraries/Bcrypt.cpp/include/bcrypt.h
        libraries/Bcrypt.cpp/src/blowfish.cpp
        src/api/Admin/AdminCreation.cpp
        src/api/Admin/AdminCreation.h
        src/api/Admin/AdminAuthorization.cpp
        src/api/Admin/AdminAuthorization.h
        src/ErrorHandler.h
)

# Пути, куда была установлена libpqxx при "make install"
include_directories(/usr/local/include)
link_directories(/usr/local/lib)

# Include directories
include_directories("libraries/Bcrypt.cpp/include")

# Find the libraries
find_package(CURL REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(PostgreSQL REQUIRED)
include(FetchContent)
FetchContent_Declare(
        spdlog
        GIT_REPOSITORY https://github.com/gabime/spdlog.git
        GIT_TAG v1.12.0
)
FetchContent_MakeAvailable(spdlog)
# Create executable
add_executable(AuthorizationService ${SOURCE_FILES})

# Link the libraries
target_link_libraries(AuthorizationService PRIVATE
        spdlog::spdlog
        CURL::libcurl
        OpenSSL::SSL
        OpenSSL::Crypto
        pqxx
        pq
)