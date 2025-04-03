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

add_executable(PaymentService ${SOURCE_FILES})

target_include_directories(PaymentService
    PRIVATE
        src
        src/database
        third_party/Bcrypt.cpp/include
)

target_link_libraries(PaymentService
    PRIVATE
        spdlog::spdlog      # spdlog, собранный FetchContent-ом
        pqxx                # из find_package(PostgreSQL)
        pq                  # из find_package(PostgreSQL)
        CURL::libcurl       # из find_package(CURL)
        OpenSSL::SSL        # из find_package(OpenSSL)
        OpenSSL::Crypto     # из find_package(OpenSSL)
)
