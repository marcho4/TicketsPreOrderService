cmake_minimum_required(VERSION 3.10)
project(UserService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
# Source files
set(SOURCE_FILES
        main.cpp
        src/api/UserAccountCRUD/CreateAccount.cpp
        src/api/UserAccountCRUD/CreateAccount.h
        src/postgres/PostgresProcessing.cpp
        src/postgres/PostgresProcessing.h
        src/utils/ValidDataChecker.h
        src/ErrorHandler.h
        src/api/EventsHistory/GetMatchHistory.cpp
        src/api/EventsHistory/GetMatchHistory.h
        src/api/UserAccountCRUD/UpdateAccount.cpp
        src/api/UserAccountCRUD/UpdateAccount.h
        src/api/UserAccountCRUD/GetAccountData.cpp
        src/api/UserAccountCRUD/GetAccountData.h
        src/api/Preorders/GetPreorders.h
        src/api/Preorders/AddPreorder/Preorder.cpp
        src/api/Preorders/AddPreorder/Preorder.h
        src/api/Preorders/CancelPreorder/PreorderCancel.cpp
        src/api/Preorders/CancelPreorder/PreorderCancel.h
        libraries/Bcrypt.cpp/src/bcrypt.cpp
        libraries/Bcrypt.cpp/include/bcrypt.h
        libraries/Bcrypt.cpp/src/blowfish.cpp
)
# Локальные include директории (например, для bcrypt)
include_directories(libraries/Bcrypt.cpp/include)

# Поиск необходимых пакетов
find_package(CURL REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(spdlog CONFIG REQUIRED)
find_package(PostgreSQL REQUIRED)

# Для libpqxx используем pkg-config (убедитесь, что libpqxx-dev установлен в контейнере)
find_package(PkgConfig REQUIRED)
pkg_check_modules(LIBPQXX REQUIRED libpqxx)

# Создание исполняемого файла
add_executable(UserService ${SOURCE_FILES})

# Линковка библиотек
target_link_libraries(UserService PRIVATE
    CURL::libcurl
    spdlog::spdlog
    OpenSSL::SSL
    OpenSSL::Crypto
    pqxx
    pq
    ${LIBPQXX_LIBRARIES}
)

# Добавляем include директории для libpqxx
target_include_directories(UserService PRIVATE ${LIBPQXX_INCLUDE_DIRS})