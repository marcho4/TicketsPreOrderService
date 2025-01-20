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
        libraries/Bcrypt.cpp/src/bcrypt.cpp
        libraries/Bcrypt.cpp/include/bcrypt.h
        libraries/Bcrypt.cpp/src/blowfish.cpp
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

find_package(PostgreSQL REQUIRED) 

# Create executable
add_executable(AuthorizationService ${SOURCE_FILES})

# Link the libraries
target_link_libraries(AuthorizationService PRIVATE
        CURL::libcurl
        OpenSSL::SSL
        OpenSSL::Crypto
        pqxx  # <-- ключевой момент
        pq    # иногда тоже нужно явно указать
)