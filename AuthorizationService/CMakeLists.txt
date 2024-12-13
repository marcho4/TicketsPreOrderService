cmake_minimum_required(VERSION 3.10)
project(TicketsPreOrderService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)

# Source files
set(SOURCE_FILES
        main.cpp
        Authorization/OrganizerAuthorizationImpl.cpp
        Authorization/OrganizerAuthorizationImpl.h
        OrganizerRegistration/OrganizerRegistrationImpl.cpp
        OrganizerRegistration/OrganizerRegistrationImpl.h
        UserRegistration/UserRegistrationImpl.cpp
        UserRegistration/UserRegistrationImpl.h
        AuxiliaryFunctions/AuxiliaryFunctions.cpp
        AuxiliaryFunctions/AuxiliaryFunctions.h
)

# Найти CURL
find_package(CURL REQUIRED)

include_directories("../libraries/libpqxx/include")
include_directories("../opt/homebrew/opt/openssl@3/include")
include_directories("../opt/homebrew/opt/libpqxx/include")
# Подключить nlohmann/json через FetchContent
include(FetchContent)

# Создать исполняемый файл
add_executable(tickets_pre_order_service ${SOURCE_FILES})

# Привязать библиотеки
target_link_libraries(tickets_pre_order_service PRIVATE CURL::libcurl
        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib)
