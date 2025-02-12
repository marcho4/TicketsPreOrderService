cmake_minimum_required(VERSION 3.11)
project(MockPaymentService VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)

set(SOURCE_FILES
        main.cpp
        ProcessPayment/PaymentWorker.cpp
        ProcessPayment/PaymentWorker.h
)

#include(FetchContent)
#FetchContent_Declare(
#        spdlog
#        GIT_REPOSITORY https://github.com/gabime/spdlog.git
#        GIT_TAG v1.12.0
#)
#FetchContent_MakeAvailable(spdlog)
add_executable(MockPaymentService ${SOURCE_FILES})

#target_link_libraries(MockPaymentService
#        PRIVATE
#        spdlog::spdlog
#)