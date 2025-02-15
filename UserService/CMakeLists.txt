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
        src/redis/RedisWaitingList.h
        src/redis/RedisWaitingList.cpp
)

# Подключаем необходимые директории
include_directories("/opt/homebrew/Cellar/curl/8.12.0/include")
link_directories("/opt/homebrew/Cellar/curl/8.12.0/lib")
include_directories("/opt/homebrew/Cellar/hiredis/1.2.0/include")

include_directories("/opt/homebrew/opt/libpqxx/include")
link_directories("/opt/homebrew/opt/libpqxx/lib")

# Include directories
include_directories("third_party/Bcrypt.cpp/include")
include_directories("third_party/libpqxx/include")
include_directories("/opt/homebrew/opt/openssl@3/include")

# Ищем необходимые библиотеки
find_package(CURL REQUIRED)
find_package(OpenSSL REQUIRED)

# Добавляем spdlog
include(FetchContent)
FetchContent_Declare(
        spdlog
        GIT_REPOSITORY https://github.com/gabime/spdlog.git
        GIT_TAG v1.12.0
)
FetchContent_MakeAvailable(spdlog)

# Указываем библиотеку hiredis
link_directories("/opt/homebrew/include")

# Создаем исполняемый файл
add_executable(UserService ${SOURCE_FILES})

# Линкуем библиотеки
target_link_libraries(UserService PRIVATE
        CURL::libcurl spdlog::spdlog
        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib
        /opt/homebrew/Cellar/hiredis/1.2.0/lib/libhiredis.dylib
        pqxx
)