cmake_minimum_required(VERSION 3.11)
project(WebhookMockService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)

set(SOURCE_FILES
        main.cpp
        src/api/payments/PaymentWorker.cpp
        src/api/payments/PaymentWorker.h
)

include_directories(
        src
        src/database
        /usr/local/include
        /usr/include
)

link_directories(
        /usr/local/lib
        /usr/lib
)

#include_directories("/opt/homebrew/Cellar/curl/8.12.0/include")
#link_directories("/opt/homebrew/Cellar/curl/8.12.0/lib")
#
#include_directories("/opt/homebrew/opt/libpqxx/include")
#link_directories("/opt/homebrew/opt/libpqxx/lib")
#
#include_directories("third_party/Bcrypt.cpp/include")
#include_directories("third_party/libpqxx/include")
#include_directories("/opt/homebrew/opt/openssl@3/include")

find_package(CURL REQUIRED)
find_package(OpenSSL REQUIRED)

add_executable(WebhookMockService ${SOURCE_FILES})

target_link_libraries(WebhookMockService
        PRIVATE
        CURL::libcurl
        OpenSSL::SSL
        OpenSSL::Crypto
)

#target_link_libraries(PaymentService PRIVATE CURL::libcurl spdlog::spdlog
#        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
#        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
#        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib
#        pqxx)