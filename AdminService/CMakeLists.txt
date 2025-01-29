cmake_minimum_required(VERSION 3.10)
project(AdminService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_OSX_ARCHITECTURES "arm64")

# Укажите путь к исходным файлам
set(ADMIN_SOURCE_FILES
        main.cpp
        src/api/RequestsHandler.cpp
        src/postgres/PostgresProcessing.cpp
)

# Добавьте каталоги для заголовочных файлов
include_directories(src)
include_directories(src/postgres)
include_directories("/opt/homebrew/Cellar/curl/8.12.0/include")
include_directories("/opt/homebrew/opt/libpqxx/include")
include_directories("/opt/homebrew/opt/openssl@3../include")
include_directories("/opt/homebrew/Cellar/curl/8.12.0/include")
link_directories("/opt/homebrew/Cellar/curl/8.12.0/lib")

include_directories("/opt/homebrew/opt/libpqxx/include")
link_directories("/opt/homebrew/opt/libpqxx/lib")

# Include directories
include_directories("/Users/nazarzakrevskij/TicketsPreOrderService/libraries/Bcrypt.cpp/include")
include_directories("../libraries/libpqxx/include")
include_directories("/opt/homebrew/opt/openssl@3/include")

# Find the libraries
find_package(CURL REQUIRED)
# Create executable
add_executable(AdminService ${ADMIN_SOURCE_FILES})
target_link_libraries(AdminService
        PRIVATE CURL::libcurl
        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib
        pqxx
)