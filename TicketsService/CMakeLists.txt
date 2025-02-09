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
        src/api/TicketsCRUD/AddTickets.cpp
        src/api/TicketsCRUD/AddTickets.h
        src/api/TicketsCRUD/GetTickets.cpp
        src/api/TicketsCRUD/GetTickets.h
)

# Добавьте каталоги для заголовочных файлов
include_directories(
        src
        src/postgres
        /usr/local/include
        /usr/include
)
include_directories("libraries/Bcrypt.cpp/include")

# Подключение директорий с библиотеками
link_directories(
        /usr/local/lib
        /usr/lib
)

# Ищем необходимые библиотеки
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
# Создаем исполняемый файл
add_executable(TicketsService ${SOURCE_FILES})

target_link_libraries(TicketsService
        PRIVATE
        spdlog::spdlog
        pqxx
        pq
        CURL::libcurl
        OpenSSL::SSL
        OpenSSL::Crypto
)