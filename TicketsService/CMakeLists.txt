cmake_minimum_required(VERSION 3.11)
project(TicketsService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)

# Исходные файлы остаются теми же
set(SOURCE_FILES
        main.cpp
        src/database/Database.h
        src/database/Database.cpp
        third_party/Bcrypt.cpp/src/bcrypt.cpp
        third_party/Bcrypt.cpp/include/bcrypt.h
        third_party/Bcrypt.cpp/src/blowfish.cpp
        src/api/tickets_crud/AddTickets.cpp
        src/api/tickets_crud/AddTickets.h
        src/api/tickets_crud/GetTickets.cpp
        src/api/tickets_crud/GetTickets.h
        src/api/tickets_status/CancelReservation.cpp
        src/api/tickets_status/CancelReservation.h
        src/api/tickets_status/TicketsReservation.cpp
        src/api/tickets_status/TicketsReservation.h
)

## Добавьте каталоги для заголовочных файлов
#include_directories(
#        src
#        src/database
#        /usr/local/include
#        /usr/include
#)
#include_directories("third_party/Bcrypt.cpp/include")
#
## Подключение директорий с библиотеками
#link_directories(
#        /usr/local/lib
#        /usr/lib
#)
include_directories("/opt/homebrew/Cellar/curl/8.12.0/include")
link_directories("/opt/homebrew/Cellar/curl/8.12.0/lib")

include_directories("/opt/homebrew/opt/libpqxx/include")
link_directories("/opt/homebrew/opt/libpqxx/lib")

# Include directories
include_directories("third_party/Bcrypt.cpp/include")
include_directories("third_party/libpqxx/include")
include_directories("/opt/homebrew/opt/openssl@3/include")

# Ищем необходимые библиотеки
find_package(CURL REQUIRED)
find_package(OpenSSL REQUIRED)
#find_package(PostgreSQL REQUIRED)
include(FetchContent)
FetchContent_Declare(
        spdlog
        GIT_REPOSITORY https://github.com/gabime/spdlog.git
        GIT_TAG v1.12.0
)
FetchContent_MakeAvailable(spdlog)
# Создаем исполняемый файл
add_executable(TicketsService ${SOURCE_FILES})

#target_link_libraries(TicketsService
#        PRIVATE
#        spdlog::spdlog
#        pqxx
#        pq
#        CURL::libcurl
#        OpenSSL::SSL
#        OpenSSL::Crypto
#)

target_link_libraries(TicketsService PRIVATE CURL::libcurl spdlog::spdlog
        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib
        pqxx)