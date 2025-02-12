cmake_minimum_required(VERSION 3.11)
project(OrganizerService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)

# Исходные файлы остаются теми же
set(SOURCE_FILES
        main.cpp
        src/utils/ValidDataChecker.h
        src/organizer_crud/CreateOrganizerAccount.cpp
        src/organizer_crud/CreateOrganizerAccount.h
        src/organizer_crud/UpdateOrganizerAccount.cpp
        src/organizer_crud/UpdateOrganizerAccount.h
        src/organizer_crud/GetAccountInfo.cpp
        src/organizer_crud/GetAccountInfo.h
        src/postgres/PostgresProcessing.h
        src/postgres/PostgresProcessing.cpp
        third_party/Bcrypt.cpp/src/bcrypt.cpp
        third_party/Bcrypt.cpp/include/bcrypt.h
        third_party/Bcrypt.cpp/src/blowfish.cpp
)

# Добавьте каталоги для заголовочных файлов
include_directories(
        src
        src/postgres
        /usr/local/include
        /usr/include
)
include_directories("third_party/Bcrypt.cpp/include")

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