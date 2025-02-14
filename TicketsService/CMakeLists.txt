cmake_minimum_required(VERSION 3.11)
project(TicketsService VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Указываем, какие файлы входят в сборку
set(SOURCE_FILES
    main.cpp
    src/database/Database.cpp
    src/database/Database.h
    third_party/Bcrypt.cpp/src/bcrypt.cpp
    third_party/Bcrypt.cpp/include/bcrypt.h
    third_party/Bcrypt.cpp/src/blowfish.cpp
    src/api/tickets_crud/AddTickets.cpp
    src/api/tickets_crud/AddTickets.h
    src/api/tickets_crud/GetTickets.cpp
    src/api/tickets_crud/GetTickets.h
    src/api/tickets_crud/DeleteTickets.cpp
    src/api/tickets_crud/DeleteTickets.h
    src/api/tickets_status/CancelReservation.cpp
    src/api/tickets_status/CancelReservation.h
    src/api/tickets_status/TicketsReservation.cpp
    src/api/tickets_status/TicketsReservation.h
)

# Ищем необходимые системные библиотеки
find_package(CURL REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(PostgreSQL REQUIRED)  # Для pqxx / pq
find_package(spdlog REQUIRED)



# Создаём исполняемый файл из исходников
add_executable(TicketsService ${SOURCE_FILES})

# Если надо - добавляем include-пути для собственных заголовков
target_include_directories(TicketsService
    PRIVATE
        src
        src/database
        third_party/Bcrypt.cpp/include
)

# Линкуем необходимые библиотеки
target_link_libraries(TicketsService
    PRIVATE
        spdlog::spdlog      # spdlog, собранный FetchContent-ом
        pqxx                # из find_package(PostgreSQL)
        pq                  # из find_package(PostgreSQL)
        CURL::libcurl       # из find_package(CURL)
        OpenSSL::SSL        # из find_package(OpenSSL)
        OpenSSL::Crypto     # из find_package(OpenSSL)
)