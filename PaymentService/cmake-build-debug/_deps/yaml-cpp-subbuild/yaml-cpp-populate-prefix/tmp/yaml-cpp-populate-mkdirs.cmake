# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "/Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-src"
  "/Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-build"
  "/Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-subbuild/yaml-cpp-populate-prefix"
  "/Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-subbuild/yaml-cpp-populate-prefix/tmp"
  "/Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-subbuild/yaml-cpp-populate-prefix/src/yaml-cpp-populate-stamp"
  "/Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-subbuild/yaml-cpp-populate-prefix/src"
  "/Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-subbuild/yaml-cpp-populate-prefix/src/yaml-cpp-populate-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-subbuild/yaml-cpp-populate-prefix/src/yaml-cpp-populate-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "/Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-subbuild/yaml-cpp-populate-prefix/src/yaml-cpp-populate-stamp${cfgdir}") # cfgdir has leading slash
endif()
