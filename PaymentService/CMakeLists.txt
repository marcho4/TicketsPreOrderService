cmake_minimum_required(VERSION 3.11)
project(PaymentService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)

set(SOURCE_FILES
        main.cpp
        src/api/payments_operations/PaymentCreator.cpp
        src/api/payments_operations/PaymentCreator.h
        src/api/payments_operations/OperationState.h
        src/api/payments_operations/OperationState.cpp
        src/database/Database.h
        src/database/Database.cpp
        src/api/webhook/WebhookWorker.cpp
        src/api/webhook/WebhookWorker.h
        src/api/providers/AddPaymentProvider.cpp
        src/api/providers/AddPaymentProvider.h
        src/api/providers/GetProviders.h
        src/api/payments_operations/PaymentRefund.cpp
        src/api/payments_operations/PaymentRefund.h
)

#include_directories(
#        src
#        src/database
#        /usr/local/include
#        /usr/include
#)
#include_directories("third_party/Bcrypt.cpp/include")
#
#link_directories(
#        /usr/local/lib
#        /usr/lib
#)

include_directories("/opt/homebrew/Cellar/curl/8.12.0/include")
link_directories("/opt/homebrew/Cellar/curl/8.12.0/lib")

include_directories("/opt/homebrew/opt/libpqxx/include")
link_directories("/opt/homebrew/opt/libpqxx/lib")

include_directories("third_party/Bcrypt.cpp/include")
include_directories("third_party/libpqxx/include")
include_directories("/opt/homebrew/opt/openssl@3/include")

find_package(CURL REQUIRED)
find_package(OpenSSL REQUIRED)
#find_package(PostgreSQL REQUIRED)
include(FetchContent)
FetchContent_Declare(
        spdlog
        GIT_REPOSITORY https://github.com/gabime/spdlog.git
        GIT_TAG v1.12.0
)
FetchContent_MakeAvailable(spdlog)

add_executable(PaymentService ${SOURCE_FILES})

#target_link_libraries(PaymentService
#        PRIVATE
#        spdlog::spdlog
#        pqxx
#        pq
#        CURL::libcurl
#        OpenSSL::SSL
#        OpenSSL::Crypto
#)

target_link_libraries(PaymentService PRIVATE CURL::libcurl spdlog::spdlog
        /opt/homebrew/opt/openssl@3/lib/libssl.dylib
        /opt/homebrew/opt/openssl@3/lib/libcrypto.dylib
        /opt/homebrew/opt/libpqxx/lib/libpqxx.dylib
        pqxx)