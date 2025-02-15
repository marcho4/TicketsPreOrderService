cmake_minimum_required(VERSION 3.11)
project(OrganizerService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)

# Исходные файлы остаются теми же
set(SOURCE_FILES
        main.cpp
        src/FormatRegexHelper/ValidDataChecker.h
        src/OrganizerAccountCRUD/CreateOrganizerAccount.cpp
        src/OrganizerAccountCRUD/CreateOrganizerAccount.h
        src/OrganizerAccountCRUD/UpdateOrganizerAccount.cpp
        src/OrganizerAccountCRUD/UpdateOrganizerAccount.h
        src/OrganizerAccountCRUD/GetAccountInfo.cpp
        src/OrganizerAccountCRUD/GetAccountInfo.h
        src/postgres/PostgresProcessing.h
        src/postgres/PostgresProcessing.cpp
        src/MatchCreating/AddingTickets/AddingTickets.cpp
        src/MatchCreating/AddingTickets/AddingTickets.h
        src/MatchCreating/CreateMatch/MatchCreator.cpp
        src/MatchCreating/CreateMatch/MatchCreator.h
        src/MatchCreating/UpdateMatchInfo/Updator.cpp
        src/MatchCreating/UpdateMatchInfo/Updator.h
        libraries/Bcrypt.cpp/src/bcrypt.cpp
        libraries/Bcrypt.cpp/include/bcrypt.h
        libraries/Bcrypt.cpp/src/blowfish.cpp
        src/MatchCreating/GetMatchInfo/GetMatchData.h
        src/MatchCreating/GetMatchInfo/GetMatchData.cpp
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
add_executable(OrganizerService ${SOURCE_FILES})

target_link_libraries(OrganizerService
        PRIVATE
        spdlog::spdlog
        pqxx
        pq
        CURL::libcurl
        OpenSSL::SSL
        OpenSSL::Crypto
)