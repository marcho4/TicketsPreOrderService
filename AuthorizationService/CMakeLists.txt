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
)

# Найти CURL
find_package(CURL REQUIRED)

# Подключить nlohmann/json через FetchContent
include(FetchContent)
FetchContent_Declare(
        nlohmann_json
        GIT_REPOSITORY https://github.com/nlohmann/json.git
        GIT_TAG v3.11.2 # Укажите версию
)
FetchContent_MakeAvailable(nlohmann_json)

# Создать исполняемый файл
add_executable(tickets_pre_order_service ${SOURCE_FILES})

# Привязать библиотеки
target_link_libraries(tickets_pre_order_service PRIVATE CURL::libcurl nlohmann_json::nlohmann_json)
