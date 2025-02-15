# Минимальная версия CMake
cmake_minimum_required(VERSION 3.10)

# Название проекта
project(UserService VERSION 1.0.0)

# Устанавливаем стандарт C++
set(CMAKE_CXX_STANDARD 17)

# Файлы исходников
set(SOURCE_FILES
        main.cpp
        src/api/user/CreateAccount.cpp
        src/api/user/CreateAccount.h
        src/database/Database.cpp
        src/database/Database.h
        src/utils/ValidDataChecker.h
        src/utils/ErrorHandler.h
        src/api/events/GetMatchHistory.cpp
        src/api/events/GetMatchHistory.h
        src/api/user/UpdateAccount.cpp
        src/api/user/UpdateAccount.h
        src/api/user/GetAccountData.cpp
        src/api/user/GetAccountData.h
        src/api/preorders/GetPreorders.h
        src/api/preorders/Preorder.cpp
        src/api/preorders/Preorder.h
        src/api/preorders/PreorderCancel.cpp
        src/api/preorders/PreorderCancel.h
        third_party/Bcrypt.cpp/src/bcrypt.cpp
        third_party/Bcrypt.cpp/include/bcrypt.h
        third_party/Bcrypt.cpp/src/blowfish.cpp
        src/redis/RedisWaitingList.h
        src/redis/RedisWaitingList.cpp
)

# Добавляем исполняемый файл до линковки
add_executable(UserService ${SOURCE_FILES})

# Подключаем заголовочные файлы
include_directories("/opt/homebrew/Cellar/curl/8.12.0/include")
include_directories("/opt/homebrew/opt/libpqxx/include")
include_directories("/opt/homebrew/opt/openssl@3/include")
include_directories("third_party/Bcrypt.cpp/include")
include_directories("third_party/libpqxx/include")
include_directories("third_party/redis-plus-plus/src")

# Подключаем библиотеки
link_directories("/opt/homebrew/Cellar/curl/8.12.0/lib")
link_directories("/opt/homebrew/opt/libpqxx/lib")

# Ищем зависимости
find_package(CURL REQUIRED)
find_package(spdlog REQUIRED)

# Ищем hiredis вручную
find_library(HIREDIS_LIBRARY NAMES hiredis PATHS /opt/homebrew/lib)
find_path(HIREDIS_INCLUDE_DIR hiredis/hiredis.h PATHS /opt/homebrew/include)

if (HIREDIS_LIBRARY AND HIREDIS_INCLUDE_DIR)
    message(STATUS "Found hiredis: ${HIREDIS_LIBRARY}")
    include_directories(${HIREDIS_INCLUDE_DIR})
else()
    message(FATAL_ERROR "hiredis not found")
endif()

# Линкуем библиотеки после объявления исполняемого файла
target_link_libraries(UserService PRIVATE CURL::libcurl spdlog::spdlog
        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib
        pqxx
        pthread
        ${HIREDIS_LIBRARY}) # Используем найденную библиотеку