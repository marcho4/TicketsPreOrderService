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
CMAKE_SOURCE_DIR = /Users/nazarzakrevskij/TicketsPreOrderService/PaymentService

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug

# Utility rule file for Nightly.

# Include any custom commands dependencies for this target.
include _deps/yaml-cpp-build/CMakeFiles/Nightly.dir/compiler_depend.make

# Include the progress variables for this target.
include _deps/yaml-cpp-build/CMakeFiles/Nightly.dir/progress.make

_deps/yaml-cpp-build/CMakeFiles/Nightly:
	cd /Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-build && /Applications/CLion.app/Contents/bin/cmake/mac/aarch64/bin/ctest -D Nightly

Nightly: _deps/yaml-cpp-build/CMakeFiles/Nightly
Nightly: _deps/yaml-cpp-build/CMakeFiles/Nightly.dir/build.make
.PHONY : Nightly

# Rule to build all files generated by this target.
_deps/yaml-cpp-build/CMakeFiles/Nightly.dir/build: Nightly
.PHONY : _deps/yaml-cpp-build/CMakeFiles/Nightly.dir/build

_deps/yaml-cpp-build/CMakeFiles/Nightly.dir/clean:
	cd /Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-build && $(CMAKE_COMMAND) -P CMakeFiles/Nightly.dir/cmake_clean.cmake
.PHONY : _deps/yaml-cpp-build/CMakeFiles/Nightly.dir/clean

_deps/yaml-cpp-build/CMakeFiles/Nightly.dir/depend:
	cd /Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /Users/nazarzakrevskij/TicketsPreOrderService/PaymentService /Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-src /Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug /Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-build /Users/nazarzakrevskij/TicketsPreOrderService/PaymentService/cmake-build-debug/_deps/yaml-cpp-build/CMakeFiles/Nightly.dir/DependInfo.cmake "--color=$(COLOR)"
.PHONY : _deps/yaml-cpp-build/CMakeFiles/Nightly.dir/depend

