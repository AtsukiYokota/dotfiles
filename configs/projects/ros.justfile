# Review this project-local file before running it. Load ros_env in your shell first.
set positional-arguments

# Show available tasks.
default:
    @just --list

# Build and refresh compile_commands.json; e.g. just build --packages-select my_package
build *args:
    ros-workspace build -- "$@"

# Merge compilation databases without rebuilding.
compdb *args:
    ros-workspace compdb "$@"

# Run tests, then show their results.
test *args:
    colcon test "$@"
    colcon test-result --verbose

# List workspace packages.
list:
    colcon list
