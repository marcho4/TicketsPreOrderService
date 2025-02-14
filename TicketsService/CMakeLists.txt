cmake_minimum_required(VERSION 3.11)
project(TicketsService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)

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
    src/api/TicketsCRUD/Delete/DeleteTickets.cpp
    src/api/TicketsCRUD/Delete/DeleteTickets.h
)
include_directories(libraries/Bcrypt.cpp/include)

find_package(CURL REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(spdlog CONFIG REQUIRED)
find_package(PostgreSQL REQUIRED)
find_package(PkgConfig REQUIRED)
pkg_check_modules(LIBPQXX REQUIRED libpqxx)

add_executable(TicketsService ${SOURCE_FILES})

target_link_libraries(TicketsService PRIVATE
    CURL::libcurl
    spdlog::spdlog
    OpenSSL::SSL
    OpenSSL::Crypto
    pqxx
    pq
    ${LIBPQXX_LIBRARIES}
)

target_include_directories(TicketsService PRIVATE ${LIBPQXX_INCLUDE_DIRS})