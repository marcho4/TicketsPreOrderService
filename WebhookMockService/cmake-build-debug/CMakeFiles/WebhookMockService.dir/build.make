# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.27

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:

#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:

# Disable VCS-based implicit rules.
% : %,v

# Disable VCS-based implicit rules.
% : RCS/%

# Disable VCS-based implicit rules.
% : RCS/%,v

# Disable VCS-based implicit rules.
% : SCCS/s.%

# Disable VCS-based implicit rules.
% : s.%

.SUFFIXES: .hpux_make_needs_suffix_list

# Command-line flag to silence nested $(MAKE).
$(VERBOSE)MAKESILENT = -s

#Suppress display of executed commands.
$(VERBOSE).SILENT:

# A target that is always out of date.
cmake_force:
.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /Applications/CLion.app/Contents/bin/cmake/mac/aarch64/bin/cmake

# The command to remove a file.
RM = /Applications/CLion.app/Contents/bin/cmake/mac/aarch64/bin/cmake -E rm -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/cmake-build-debug

# Include any dependencies generated for this target.
include CMakeFiles/WebhookMockService.dir/depend.make
# Include any dependencies generated by the compiler for this target.
include CMakeFiles/WebhookMockService.dir/compiler_depend.make

# Include the progress variables for this target.
include CMakeFiles/WebhookMockService.dir/progress.make

# Include the compile flags for this target's objects.
include CMakeFiles/WebhookMockService.dir/flags.make

CMakeFiles/WebhookMockService.dir/main.cpp.o: CMakeFiles/WebhookMockService.dir/flags.make
CMakeFiles/WebhookMockService.dir/main.cpp.o: /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/main.cpp
CMakeFiles/WebhookMockService.dir/main.cpp.o: CMakeFiles/WebhookMockService.dir/compiler_depend.ts
	@$(CMAKE_COMMAND) -E cmake_echo_color "--switch=$(COLOR)" --green --progress-dir=/Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/cmake-build-debug/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object CMakeFiles/WebhookMockService.dir/main.cpp.o"
	/Library/Developer/CommandLineTools/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -MD -MT CMakeFiles/WebhookMockService.dir/main.cpp.o -MF CMakeFiles/WebhookMockService.dir/main.cpp.o.d -o CMakeFiles/WebhookMockService.dir/main.cpp.o -c /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/main.cpp

CMakeFiles/WebhookMockService.dir/main.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color "--switch=$(COLOR)" --green "Preprocessing CXX source to CMakeFiles/WebhookMockService.dir/main.cpp.i"
	/Library/Developer/CommandLineTools/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/main.cpp > CMakeFiles/WebhookMockService.dir/main.cpp.i

CMakeFiles/WebhookMockService.dir/main.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color "--switch=$(COLOR)" --green "Compiling CXX source to assembly CMakeFiles/WebhookMockService.dir/main.cpp.s"
	/Library/Developer/CommandLineTools/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/main.cpp -o CMakeFiles/WebhookMockService.dir/main.cpp.s

CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.o: CMakeFiles/WebhookMockService.dir/flags.make
CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.o: /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/src/api/payments/PaymentWorker.cpp
CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.o: CMakeFiles/WebhookMockService.dir/compiler_depend.ts
	@$(CMAKE_COMMAND) -E cmake_echo_color "--switch=$(COLOR)" --green --progress-dir=/Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/cmake-build-debug/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Building CXX object CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.o"
	/Library/Developer/CommandLineTools/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -MD -MT CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.o -MF CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.o.d -o CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.o -c /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/src/api/payments/PaymentWorker.cpp

CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color "--switch=$(COLOR)" --green "Preprocessing CXX source to CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.i"
	/Library/Developer/CommandLineTools/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/src/api/payments/PaymentWorker.cpp > CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.i

CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color "--switch=$(COLOR)" --green "Compiling CXX source to assembly CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.s"
	/Library/Developer/CommandLineTools/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/src/api/payments/PaymentWorker.cpp -o CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.s

# Object files for target WebhookMockService
WebhookMockService_OBJECTS = \
"CMakeFiles/WebhookMockService.dir/main.cpp.o" \
"CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.o"

# External object files for target WebhookMockService
WebhookMockService_EXTERNAL_OBJECTS =

WebhookMockService: CMakeFiles/WebhookMockService.dir/main.cpp.o
WebhookMockService: CMakeFiles/WebhookMockService.dir/src/api/payments/PaymentWorker.cpp.o
WebhookMockService: CMakeFiles/WebhookMockService.dir/build.make
WebhookMockService: /opt/homebrew/Cellar/curl/8.11.1/lib/libcurl.dylib
WebhookMockService: /opt/homebrew/Cellar/openssl@3/3.4.0/lib/libssl.dylib
WebhookMockService: /opt/homebrew/Cellar/openssl@3/3.4.0/lib/libcrypto.dylib
WebhookMockService: CMakeFiles/WebhookMockService.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color "--switch=$(COLOR)" --green --bold --progress-dir=/Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/cmake-build-debug/CMakeFiles --progress-num=$(CMAKE_PROGRESS_3) "Linking CXX executable WebhookMockService"
	$(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/WebhookMockService.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
CMakeFiles/WebhookMockService.dir/build: WebhookMockService
.PHONY : CMakeFiles/WebhookMockService.dir/build

CMakeFiles/WebhookMockService.dir/clean:
	$(CMAKE_COMMAND) -P CMakeFiles/WebhookMockService.dir/cmake_clean.cmake
.PHONY : CMakeFiles/WebhookMockService.dir/clean

CMakeFiles/WebhookMockService.dir/depend:
	cd /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/cmake-build-debug && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/cmake-build-debug /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/cmake-build-debug /Users/nazarzakrevskij/TicketsPreOrderService/WebhookMockService/cmake-build-debug/CMakeFiles/WebhookMockService.dir/DependInfo.cmake "--color=$(COLOR)"
.PHONY : CMakeFiles/WebhookMockService.dir/depend

