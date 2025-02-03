cmake_minimum_required(VERSION 3.11)
project(AdminService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)

set(ADMIN_SOURCE_FILES
        main.cpp
        src/api/RequestsHandler.cpp
        src/postgres/PostgresProcessing.cpp
)

include_directories(
        src
        src/postgres
        /usr/local/include
        /usr/include
)

link_directories(
        /usr/local/lib
        /usr/lib
)

include(FetchContent)

FetchContent_Declare(
        spdlog
        GIT_REPOSITORY https://github.com/gabime/spdlog.git
        GIT_TAG v1.12.0
)
FetchContent_MakeAvailable(spdlog)

add_executable(AdminService ${ADMIN_SOURCE_FILES})

find_package(CURL REQUIRED)
find_package(OpenSSL REQUIRED)

target_link_libraries(AdminService
        PRIVATE
        spdlog::spdlog
        pqxx
        pq
        CURL::libcurl
        OpenSSL::SSL
        OpenSSL::Crypto
)