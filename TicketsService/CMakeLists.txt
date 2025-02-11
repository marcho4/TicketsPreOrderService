cmake_minimum_required(VERSION 3.11)
project(TicketsService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)

# Исходные файлы остаются теми же
set(SOURCE_FILES
        main.cpp
        src/postgres/PostgresProcessing.h
        src/postgres/PostgresProcessing.cpp
        libraries/Bcrypt.cpp/src/bcrypt.cpp
        libraries/Bcrypt.cpp/include/bcrypt.h
        libraries/Bcrypt.cpp/src/blowfish.cpp
        src/api/TicketsCRUD/Add/AddTickets.cpp
        src/api/TicketsCRUD/Add/AddTickets.h
        src/api/TicketsCRUD/Get/GetTickets.cpp
        src/api/TicketsCRUD/Get/GetTickets.h
        src/api/TicketsStatus/Cancel/CancelReservation.cpp
        src/api/TicketsStatus/Cancel/CancelReservation.h
        src/api/TicketsStatus/Reserve/TicketsReservation.cpp
        src/api/TicketsStatus/Reserve/TicketsReservation.h
)

## Добавьте каталоги для заголовочных файлов
#include_directories(
#        src
#        src/postgres
#        /usr/local/include
#        /usr/include
#)
#include_directories("libraries/Bcrypt.cpp/include")
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
include_directories("libraries/Bcrypt.cpp/include")
include_directories("libraries/libpqxx/include")
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